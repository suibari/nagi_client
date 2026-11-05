import type { CrosspostRef, PostView } from '$lib/api/types';
import { blueskyPostsExist } from './bluesky';

/**
 * Bluesky 側のコピーが消えていた投稿。Nagi はその削除を知る手段が無い（AppView は Bluesky の
 * 投稿を見ていない）ので、返信・引用の画面で確かめて分かったものをこの端末に覚えておく。
 * Nagi のレコードは書き換えない（書き換えると AppView が「編集」と見なすため）。
 */
const STORAGE_KEY = 'nagi-crosspost-gone';

function readGone(): string[] {
	try {
		const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
		return Array.isArray(value)
			? value.filter((uri): uri is string => typeof uri === 'string')
			: [];
	} catch {
		return [];
	}
}

class GoneCrossposts {
	// 生成時に一度だけ読む。$derived の中から has() が呼ばれるので、読むたびに $state を書き換えてはいけない。
	#uris = $state<string[]>(typeof localStorage === 'undefined' ? [] : readGone());

	has(uri: string): boolean {
		return this.#uris.includes(uri);
	}

	add(uri: string) {
		if (this.has(uri)) return;
		// 上限を設けて古いものから捨てる。消えたコピーを延々と覚え続けない。
		this.#uris = [...this.#uris, uri].slice(-200);
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this.#uris));
		} catch {
			// 覚えられなくても、このタブの中では効く。
		}
	}
}

export const goneCrossposts = new GoneCrossposts();

/**
 * 自分のクロスポスト済みの投稿か。返信・引用を Bluesky にも続けられるのはこれだけ
 * （他人のクロスポストへは続けない。相手が Nagi で書いたものに Bluesky で反応が付くのを避ける）。
 */
export function ownCrosspost(
	post: Pick<PostView, 'uri' | 'author' | 'crosspost' | 'kossori' | 'threadKossori'> | undefined,
	viewerDid: string | undefined,
): CrosspostRef | undefined {
	if (!post?.crosspost || !viewerDid || post.author.did !== viewerDid) return undefined;
	if (post.kossori || post.threadKossori || goneCrossposts.has(post.uri)) return undefined;
	return post.crosspost;
}

export type CrosspostTargetState = 'checking' | 'ok' | 'gone' | 'failed';

/** コピーがまだあるか確かめる。消えていたら覚えて、ラベルもこの端末では外す。 */
export async function checkCrosspostTarget(
	postUri: string,
	ref: CrosspostRef,
	kind: 'reply' | 'quote' = 'reply',
): Promise<Exclude<CrosspostTargetState, 'checking'>> {
	const refs = (kind === 'quote' ? [ref.root] : [ref.root, ref.tail, ref.threadRoot]).filter(
		(item, index, list) => list.findIndex((other) => other.uri === item.uri) === index,
	);
	try {
		if (await blueskyPostsExist(refs)) return 'ok';
		goneCrossposts.add(postUri);
		return 'gone';
	} catch {
		return 'failed';
	}
}
