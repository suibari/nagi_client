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
