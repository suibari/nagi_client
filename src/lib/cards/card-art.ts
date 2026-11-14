/**
 * 透過の線画で描かれた背景絵。ダークテーマで線を反転して見せる対象。
 * 不透明なフルカラーの絵を入れると反転で色が崩れるので、線画だけを足すこと。
 */
const LINE_ART = new Set(['anniv-hbd']);

export function isLineArt(art: string | undefined): boolean {
	return !!art && LINE_ART.has(art);
}
