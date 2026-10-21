import { redirect } from '@sveltejs/kit';
import { getRecord } from '$lib/atproto/pds';
import { hashtagHref } from '$lib/tags';

/**
 * チャンネルはハッシュタグへ統合して廃止した。外に貼られた旧リンクは、チャンネル名の
 * タグページへ送る（AppView は旧チャンネル投稿をチャンネル名のタグとして返す）。
 * AppView にチャンネルを引く API はもう無いので、名前は作成者の PDS から直接読む。
 */
export const load = async ({ params }) => {
	const record = await getRecord(params.did, 'com.suibari.nagi.channel', params.rkey);
	const name = (record?.value as { name?: unknown } | undefined)?.name;
	redirect(307, typeof name === 'string' && name.trim() ? hashtagHref(name) : '/search');
};
