/**
 * sitemap.xml に載せる静的パス。動的なニュース記事は fetchIndexableNews() が足す。
 *
 * ここを配列として切り出してあるのは、`sitemap.xml/+server.ts` を実行しなくても
 * 「sitemap に書いたパスが本当にプリレンダされているか」をテストで突き合わせられるようにするため。
 * 実体の無いURLを sitemap に載せると、クローラは404を踏み、以後クロール頻度が落ちる。
 */
export const SITEMAP_ROUTES = ['/', '/about', '/terms', '/privacy', '/news'] as const;
