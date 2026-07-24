import type { ChannelView } from '$lib/api/types';

/**
 * 作成したチャンネルの楽観表示。
 * PDS の createRecord 完了から AppView の取り込みまでは短い時間差があるため、遷移先で
 * getChannel が 404 になっても作成済みの内容を表示できるようセッション内に保持する。
 */
type CreatedChannelEntry = { channel: ChannelView; bannerUrl?: string };

class CreatedChannels {
	entries = $state<CreatedChannelEntry[]>([]);
	get(uri: string) {
		return this.entries.find((entry) => entry.channel.uri === uri)?.channel;
	}
	add(channel: ChannelView, banner?: Blob) {
		this.remove(channel.uri);
		const bannerUrl = banner ? URL.createObjectURL(banner) : undefined;
		this.entries = [
			...this.entries,
			{
				channel: { ...channel, ...(bannerUrl ? { banner: bannerUrl } : {}) },
				bannerUrl,
			},
		];
	}
	remove(uri: string) {
		const entry = this.entries.find((candidate) => candidate.channel.uri === uri);
		if (entry?.bannerUrl) URL.revokeObjectURL(entry.bannerUrl);
		this.entries = this.entries.filter((candidate) => candidate.channel.uri !== uri);
	}
}

export const createdChannels = new CreatedChannels();

/**
 * 削除したチャンネルの楽観的除外。
 * CH 削除レコードが Jetstream 経由で AppView に反映されるまでは getChannels が
 * まだそのチャンネルを返すため、削除直後に一覧へ戻ると残って見える。ここに URI を
 * 覚えておき、一覧描画時に除外する。セッション内だけ保持すれば十分（リロード時には
 * 取り込みが済んでいて API 側からも消えている）。
 */
class DeletedChannels {
	uris = $state<string[]>([]);
	has(uri: string) {
		return this.uris.includes(uri);
	}
	add(uri: string) {
		if (!this.uris.includes(uri)) this.uris = [...this.uris, uri];
	}
}

export const deletedChannels = new DeletedChannels();
