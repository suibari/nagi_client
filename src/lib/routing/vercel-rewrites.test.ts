// 静的ソース検査は Vitest の Node 環境で実行する。
import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * adapter-static は SPA を 200.html ひとつに畳む。Vercel はそれを自動で拾わないので、
 * 「アプリ専用ルートだけ vercel.json から 200.html へ流し、未知のURLは404にする」
 * （vite.config.ts）。つまり **ルートを足して rewrites に書き忘れると、そのURLは
 * 直リンクとリロードで 404 になる**。画面遷移では踏めないので、気づくのは公開後になる。
 * ここで routes ディレクトリと vercel.json を突き合わせて、その取りこぼしを止める。
 */

const routesDir = new URL('../../routes/', import.meta.url);
const vercel = JSON.parse(
	readFileSync(new URL('../../../vercel.json', import.meta.url), 'utf8'),
) as {
	rewrites: { source: string; destination: string }[];
	headers: { source: string; headers: { key: string; value: string }[] }[];
};

/** ルートパスと、そのページがプリレンダリングされるか（= 実体のHTMLが出るか）。 */
function collectRoutes(dir = routesDir, path = ''): { path: string; prerendered: boolean }[] {
	const found: { path: string; prerendered: boolean }[] = [];
	const entries = readdirSync(dir, { withFileTypes: true });
	if (entries.some((e) => e.name === '+page.svelte')) {
		const config = entries.some((e) => e.name === '+page.ts')
			? readFileSync(new URL('+page.ts', dir), 'utf8')
			: '';
		found.push({ path: path || '/', prerendered: /export const prerender = true/.test(config) });
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
const spaRoutes = routes.filter((r) => !r.prerendered);

describe('vercel SPA rewrites', () => {
	it('finds the app routes to check', () => {
		// 走査そのものが壊れたときに、0件を「全部通った」と読み違えないようにする。
		expect(routes.length).toBeGreaterThan(30);
		expect(routes.map((r) => r.path)).toContain('/cards');
		expect(routes.find((r) => r.path === '/about')?.prerendered).toBe(true);
	});

	it('routes every non-prerendered page to the SPA fallback', () => {
		const rewrites = vercel.rewrites.map((r) => ({ ...r, match: matcher(r.source) }));
		const missing = spaRoutes
			.filter(({ path }) => !rewrites.some((r) => r.match.test(concrete(path))))
			.map((r) => r.path);
		expect(missing).toEqual([]);
	});

	it('keeps the SPA fallback out of the search index', () => {
		// 200.html は中身の無い殻。どのURLで拾われても同じものが見えるので、載せない。
		const robots = vercel.headers
			.filter((h) => h.headers.some((v) => v.key === 'X-Robots-Tag' && /noindex/.test(v.value)))
			.map((h) => matcher(h.source));
		const indexable = spaRoutes
			.filter(({ path }) => !robots.some((r) => r.test(concrete(path))))
			.map((r) => r.path);
		expect(indexable).toEqual([]);
	});
});
