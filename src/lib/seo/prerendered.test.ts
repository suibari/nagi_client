import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SITEMAP_ROUTES } from './sitemap';

/**
 * ビルド成果物そのものを見るテスト。
 *
 * Playwright の webServer は `npm run dev` で、プリレンダを通らない（playwright.config.ts）。
 * つまり E2E はハイドレーション**後**の DOM しか見られず、**クローラが受け取る HTML**を
 * 誰も検証していなかった。ここがその穴を塞ぐ。
 *
 * `build/` が無ければ丸ごとスキップする。CI では `npm run build && npm test` の順に流すこと。
 */

const buildDir = new URL('../../../build/', import.meta.url);
const built = existsSync(buildDir);
const read = (file: string) => readFileSync(new URL(file, buildDir), 'utf8');

/** <script> を除いた本文テキスト。中身があるか＝殻でないかを見る。 */
function bodyText(html: string): string {
	const body = /<body[^>]*>([\s\S]*)<\/body>/.exec(html)?.[1] ?? '';
	return body
		.replace(/<script[\s\S]*?<\/script>/g, '')
		.replace(/<[^>]+>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

const robotsOf = (html: string) => /<meta name="robots" content="([^"]*)"/.exec(html)?.[1];

describe.skipIf(!built)('prerendered output', () => {
	it('gives the fallback shell no indexable identity of its own', () => {
		const shell = read('200.html');
		// 殻には robots メタも <title> も無い（ssr:false で生成されるので layout の
		// <svelte:head> が動かない）。これを索引から外しているのは vercel.json の
		// X-Robots-Tag だけ —— だからこそ SPA ルートのヘッダは消してはいけない。
		expect(robotsOf(shell)).toBeUndefined();
		expect(shell).not.toContain('<title>');
	});

	it('serves the homepage with real copy, not a spinner', () => {
		const html = read('index.html');
		expect(robotsOf(html)).toBe('index,follow');
		// ゲートの中に戻すと、ここがスピナーだけになる。
		expect(bodyText(html).length).toBeGreaterThan(120);
		expect(html).toContain('class="hero"');
	});

	it.each(['/about', '/terms', '/privacy'])(
		'serves %s as indexable HTML with a canonical',
		(path) => {
			const html = read(`${path.slice(1)}.html`);
			expect(robotsOf(html)).toBe('index,follow');
			expect(html).toContain(`rel="canonical" href="https://nagi.suibari.com${path}"`);
			expect(bodyText(html).length).toBeGreaterThan(120);
		},
	);

	it('indexes the news list only when the build actually got articles', () => {
		// AppView が落ちている／まだ listIndexableNews を持っていないビルドでは記事が0件になる。
		// そのとき中身の無い一覧を index,follow で出すのは noindex より悪いので、
		// +page.ts が noindex へ落とす。ここではその対応関係そのものを固定する。
		const html = read('news.html');
		expect(html).toContain('rel="canonical" href="https://nagi.suibari.com/news"');
		const hasArticles = html.includes('href="/news/');
		expect(robotsOf(html)).toBe(hasArticles ? 'index,follow' : 'noindex,follow');
	});

	it('never marks a page indexable without giving it something to index', () => {
		// 索引対象 ⇒ 中身がある、という一方向の含意。これが崩れると空ページが検索に載る。
		for (const path of SITEMAP_ROUTES) {
			const file = path === '/' ? 'index.html' : `${path.slice(1)}.html`;
			if (!existsSync(new URL(file, buildDir))) continue;
			const html = read(file);
			if (robotsOf(html) !== 'index,follow') continue;
			expect(bodyText(html).length, `${path} is indexable but nearly empty`).toBeGreaterThan(120);
		}
	});

	it('lists in the sitemap only what was actually built', () => {
		const locs = [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
		expect(locs.length).toBeGreaterThanOrEqual(SITEMAP_ROUTES.length);
		for (const loc of locs) {
			const path = new URL(loc).pathname;
			const file = path === '/' ? 'index.html' : `${path.slice(1)}.html`;
			expect(existsSync(new URL(file, buildDir)), `${loc} has no built HTML`).toBe(true);
		}
	});
});
