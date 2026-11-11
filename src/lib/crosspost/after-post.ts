import { attachCrosspost, type PostAssets, type PostDraft } from '$lib/atproto/records';
import { m } from '$lib/i18n/i18n.svelte';
import { CrosspostPartialError, crosspostToBluesky, type CrosspostTarget } from './bluesky';
import { getCrosspostEnabled, hasCrosspostScope } from './preferences';

/**
 * 保存できた Nagi の投稿を Bluesky にも出し、コピーへの参照を投稿へ足す。
 * どこで失敗しても Nagi の投稿は成功のまま。例外は投げず、Bluesky に何が残ったかを警告文で返す。
 */
export async function crosspostAfterPost(
	draft: PostDraft,
	assets: PostAssets,
	target: CrosspostTarget,
	uri: string,
): Promise<string | undefined> {
	const permitted = getCrosspostEnabled() && (await hasCrosspostScope().catch(() => false));
	if (!permitted) return m.crosspostPermissionMissing();
	let result;
	try {
		result = await crosspostToBluesky(draft, assets, target);
	} catch (e) {
		if (e instanceof CrosspostPartialError) return m.crosspostPartial();
		return e instanceof Error ? e.message : m.crosspostFailed();
	}
	if (!result) return;
	try {
		await attachCrosspost(uri, result.ref);
	} catch {
		return m.crosspostLinkFailed();
	}
}
