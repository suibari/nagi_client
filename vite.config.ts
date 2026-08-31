import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { loadEnv } from 'vite';
// defineConfig は vitest/config のもの（vite の型を包含し、test ブロックを足せる）。
import { defineConfig } from 'vitest/config';

export default defineConfig(({ command, mode }) => {
	// mode は任意名に変更できるため、開発サーバーか本番ビルドかは command で判定する。
	const isDev = command === 'serve';
	const publicEnv = loadEnv(mode, '.', 'PUBLIC_');
	const directAppView = publicEnv.PUBLIC_APPVIEW_DIRECT === 'true';
	const appViewTarget = publicEnv.PUBLIC_APPVIEW_URL || 'http://127.0.0.1:3202';

	// 本番は https ホスト（appview・PDS・bsky.social）のみに接続するが、dev では
	// ローカル appview に http://localhost で接続する（XRPC も blob 画像も）ため、
	// dev のときだけ connect-src / img-src で許可する。
	return {
		// ブラウザからローカル AppView を直接参照すると、svelte-kit sync が生成した本番用
		// CSP を開発サーバーが再利用した際に拒否される。開発時は同一オリジンへ寄せ、
		// Vite が AppView へ転送することで CSP の生成タイミングに依存させない。
		server:
			isDev && directAppView
				? {
						proxy: {
							'/xrpc': { target: appViewTarget, changeOrigin: true },
							'/api/blob': { target: appViewTarget, changeOrigin: true },
							'/api/emoji-asset': { target: appViewTarget, changeOrigin: true },
						},
					}
				: undefined,
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
				// index.html は検索向けにプリレンダリングしたトップページとして残す。
				// アプリ専用ルートだけ vercel.json から 200.html へ流し、未知のURLは404にする。
				adapter: adapter({ fallback: '200.html' }),

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
							? ['self', 'https:', 'data:', 'http://localhost:*', 'http://127.0.0.1:*']
							: ['self', 'https:', 'data:'],
						'base-uri': ['self'],
						'form-action': ['self'],
						'object-src': ['none'],
					},
				},
			}),
		],
		// 対象は UI を持たない純ロジック（facet 計算・URL 解釈・レコード組み立てなど）。
		// コンポーネントは jsdom を足すまで対象外なので、拾うのは .ts のテストだけにする。
		test: {
			include: ['src/**/*.test.ts', 'api/**/*.test.ts'],
			environment: 'node',
		},
	};
});
