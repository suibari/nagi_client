// 静的ソース検査は Vitest の Node 環境で実行する。
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SITEMAP_ROUTES } from '$lib/seo/sitemap';

/**
 * adapter-static は SPA を 200.html ひとつに畳む。Vercel はそれを自動で拾わないので、
 * 「アプリ専用ルートだけ vercel.json から 200.html へ流し、未知のURLは404にする」
 * （vite.config.ts）。つまり **ルートを足して rewrites に書き忘れると、そのURLは
 * 直リンクとリロードで 404 になる**。画面遷移では踏めないので、気づくのは公開後になる。
 * ここで routes ディレクトリと vercel.json を突き合わせて、その取りこぼしを止める。
 *
 * ルートは3種類ある。混ぜると検索インデックスが静かに壊れるので区別する。
 *
 * - `'all'`  … 実体のHTMLが必ず出る（`/about` など）。rewrite は不要
 * - `'entries'` … `entries()` が列挙した分だけHTMLが出る（`/news/[rkey]`）。
 *                 **rewrite もヘッダも付けてはいけない** —— 詳細は下のテスト参照
 * - `false`  … 常に 200.html の殻。rewrite と noindex ヘッダの両方が要る
 */

const routesDir = new URL('../../routes/', import.meta.url);
const vercel = JSON.parse(
	readFileSync(new URL('../../../vercel.json', import.meta.url), 'utf8'),
) as {
	rewrites: { source: string; destination: string }[];
	headers: { source: string; headers: { key: string; value: string }[] }[];
};

type Prerender = 'all' | 'entries' | false;
type Route = { path: string; prerendered: Prerender; hasSeo: boolean };

/**
 * `/global` は中身がクローラ向けに描かれていないので、意図して seo を持たない
 * （= noindex のまま）。暗黙の穴にせず、名前で見えるようにしておく。
 */
const NO_SEO_ALLOWLIST = ['/global'];

function collectRoutes(dir = routesDir, path = ''): Route[] {
	const found: Route[] = [];
	const entries = readdirSync(dir, { withFileTypes: true });
	if (entries.some((e) => e.name === '+page.svelte')) {
		const config = entries.some((e) => e.name === '+page.ts')
			? readFileSync(new URL('+page.ts', dir), 'utf8')
			: '';
		const prerendered: Prerender = !/export const prerender = true/.test(config)
			? false
			: /export (async )?function entries/.test(config)
				? 'entries'
				: 'all';
		found.push({ path: path || '/', prerendered, hasSeo: /\bseo\b/.test(config) });
	}
	for (const entry of entries) {
		// グループ化ルート (group) はURLに現れない。
		if (!entry.isDirectory() || entry.name.startsWith('(')) continue;
		found.push(...collectRoutes(new URL(`${entry.name}/`, dir), `${path}/${entry.name}`));
	}
	return found;
}

/** SvelteKit の [param] を、パターン照合用の具体的なセグメントに置き換える。 */
const concrete = (route: string) => route.replace(/\[[^\]]+\]/g, 'x');

/** Vercel の :param / :path* を正規表現にする。:path* は親パスそのものにも当たる。 */
function matcher(source: string): RegExp {
	const pattern = source
		.replace(/\/:[A-Za-z0-9_]+\*/g, '(?:/[^/]+)*')
		.replace(/:[A-Za-z0-9_]+/g, '[^/]+');
	return new RegExp(`^${pattern}$`);
}

const routes = collectRoutes();
const shellRoutes = routes.filter((r) => r.prerendered === false);
const entryRoutes = routes.filter((r) => r.prerendered === 'entries');
const rewriteMatchers = vercel.rewrites.map((r) => matcher(r.source));
const noindexMatchers = vercel.headers
	.filter((h) => h.headers.some((v) => v.key === 'X-Robots-Tag' && /noindex/.test(v.value)))
	.map((h) => matcher(h.source));

describe('vercel SPA rewrites', () => {
	it('finds the app routes to check', () => {
		// 走査そのものが壊れたときに、0件を「全部通った」と読み違えないようにする。
		expect(routes.length).toBeGreaterThan(30);
		expect(routes.map((r) => r.path)).toContain('/cards');
		expect(routes.find((r) => r.path === '/about')?.prerendered).toBe('all');
		expect(routes.find((r) => r.path === '/news/[rkey]')?.prerendered).toBe('entries');
	});

	it('routes every shell-only page to the SPA fallback', () => {
		const missing = shellRoutes
			.filter(({ path }) => !rewriteMatchers.some((m) => m.test(concrete(path))))
			.map((r) => r.path);
		expect(missing).toEqual([]);
	});

	it('keeps the SPA fallback out of the search index', () => {
		// 200.html は中身の無い殻。どのURLで拾われても同じものが見えるので、載せない。
		const indexable = shellRoutes
			.filter(({ path }) => !noindexMatchers.some((m) => m.test(concrete(path))))
			.map((r) => r.path);
		expect(indexable).toEqual([]);
	});

	it('never sends an entries() route to the shell or marks it noindex', () => {
		// ここが逆向きのアサート。entries() ルートに…
		// - rewrite を足すと、まだビルドされていないURLが「中身の無い殻」として配られる。
		//   殻の <head> には robots メタも <title> も無い（ssr:false で生成されるため）ので、
		//   それは索引可能な空ページになる
		// - noindex ヘッダを足すと、ヘッダはファイルシステムより先に評価されるので、
		//   プリレンダ済みの記事ページまで巻き込んで索引が全滅する
		// どちらも壊れ方が静かなので、両方をテストで塞ぐ。
		for (const { path } of entryRoutes) {
			const url = concrete(path);
			expect(
				rewriteMatchers.filter((m) => m.test(url)),
				`${path} must not be rewritten to the SPA shell`,
			).toEqual([]);
			expect(
				noindexMatchers.filter((m) => m.test(url)),
				`${path} must not carry an X-Robots-Tag`,
			).toEqual([]);
		}
	});

	it('gives every prerendered route its own seo, or names it as an exception', () => {
		// seo を返さないページは layout が noindex を出す。プリレンダしたのに seo を
		// 付け忘れると、中身のあるHTMLを自分で検索から締め出すことになる（`/global` の事故）。
		const missing = routes
			.filter((r) => r.prerendered !== false && !r.hasSeo)
			.map((r) => r.path)
			.filter((path) => !NO_SEO_ALLOWLIST.includes(path));
		expect(missing).toEqual([]);
	});
});

describe('sitemap', () => {
	it('only lists paths that are actually prerendered with seo', () => {
		const indexable = new Set(
			routes.filter((r) => r.prerendered === 'all' && r.hasSeo).map((r) => r.path),
		);
		const broken = SITEMAP_ROUTES.filter((path) => !indexable.has(path));
		expect(broken).toEqual([]);
	});

	it('is not also shipped as a static file', () => {
		// static/sitemap.xml とルートが両方あると build/sitemap.xml の取り合いになる。
		expect(existsSync(new URL('../../../static/sitemap.xml', import.meta.url))).toBe(false);
	});
});
