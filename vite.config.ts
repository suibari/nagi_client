import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
	const isDev = mode === 'development';

	// 本番は https ホスト（appview・PDS・bsky.social）のみに接続するが、dev では
	// ローカル appview に http://localhost で接続する（XRPC も blob 画像も）ため、
	// dev のときだけ connect-src / img-src で許可する。
	return {
		plugins: [
			tailwindcss(),
			sveltekit({
				compilerOptions: {
					// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
					runes: ({ filename }) =>
						filename.split(/[/\\]/).includes('node_modules') ? undefined : true,
				},

				// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
				// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
				// See https://svelte.dev/docs/kit/adapters for more information about adapters.
				// Vercel は 200.html の SPA フォールバック規約を解さないため、index.html を
				// 出力して vercel.json の rewrites で全ルートをそこへ流す。
				adapter: adapter({ fallback: 'index.html' }),

				// Content-Security-Policy を <meta> タグとして出力する。hash モードにより
				// SvelteKit が自身のインラインbootstrap scriptをビルド毎にハッシュ化するため、
				// 古いハッシュを手書きせずとも script-src を 'self' に保てる。atproto は任意の
				// PDS/OAuth ホストへ接続するため connect-src/img-src で https: を許可する。
				// frame-ancestors はヘッダ限定のため vercel.json の X-Frame-Options で対応。
				csp: {
					mode: 'hash',
					directives: {
						'default-src': ['self'],
						'script-src': ['self'],
						'style-src': ['self', 'unsafe-inline'],
						// OAuth ループバックは localhost を拒否するため dev はページを 127.0.0.1 で開く。
						// appview も 127.0.0.1 で開くケースに備え、localhost と 127.0.0.1 の両方を許可する。
						'img-src': isDev
							? ['self', 'https:', 'data:', 'blob:', 'http://localhost:*', 'http://127.0.0.1:*']
							: ['self', 'https:', 'data:', 'blob:'],
						'font-src': ['self', 'data:'],
						'connect-src': isDev
							? ['self', 'https:', 'http://localhost:*', 'http://127.0.0.1:*']
							: ['self', 'https:'],
						'base-uri': ['self'],
						'form-action': ['self'],
						'object-src': ['none']
					}
				},
			}),
		],
	};
});
