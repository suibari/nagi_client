declare global {
	const __NAGI_OAUTH_DEPLOYMENT__: import('$lib/oauth/deployment').OAuthDeployment;

	namespace App {
		interface PageData {
			/** ルートが返した検索向けメタデータ。無い＝索引させない。 */
			seo?: import('$lib/seo/seo').PageSeo;
		}
	}
}

export {};
