/**
 * こっそり投稿は PDS ではなく AppView が正本を持つ。その AT-URI は著者ではなく
 * AppView の DID 配下で発行される — 「みんなで全肯定」の匿名要約や、そこに付いた
 * 他人のリアクションレコードから著者を辿れないようにするため。
 *
 * よって「URI の authority ＝ 著者の DID」は成り立たない。URI から作者を取り出す処理は
 * 書かず、著者は必ず PostView.author.did を見ること。
 */
export const APPVIEW_DID = 'did:web:nagi-api.suibari.com';

/** AppView が正本を持つレコード（＝PDS に無いので repo 操作の対象にならない）か。 */
export function isAppviewOwnedUri(uri: string): boolean {
	return uri.startsWith(`at://${APPVIEW_DID}/`);
}
