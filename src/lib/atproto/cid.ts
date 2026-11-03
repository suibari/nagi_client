const BASE32 = 'abcdefghijklmnopqrstuvwxyz234567';

/** RFC 4648 の base32（小文字・パディング無し）。multibase の 'b'。 */
function base32(bytes: Uint8Array): string {
	let out = '';
	let buffer = 0;
	let bits = 0;
	for (const byte of bytes) {
		buffer = (buffer << 8) | byte;
		bits += 8;
		while (bits >= 5) {
			out += BASE32[(buffer >>> (bits - 5)) & 31];
			bits -= 5;
		}
	}
	if (bits > 0) out += BASE32[(buffer << (5 - bits)) & 31];
	return out;
}

/**
 * blob の CID を手元で計算する。atproto の blob は CIDv1・raw コーデック（0x55）・
 * sha2-256 で、PDS の uploadBlob が返す ref と同じ値になる。
 * 記事本文に画像の URL を書くには CID が要るが、アップロードは投稿時まで遅らせたい
 * （下書きのまま放置すると、参照の無い blob は PDS に消される）ので、先に計算する。
 */
export async function computeBlobCid(blob: Blob): Promise<string> {
	const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', await blob.arrayBuffer()));
	const bytes = new Uint8Array(4 + digest.length);
	bytes.set([0x01, 0x55, 0x12, 0x20]);
	bytes.set(digest, 4);
	return `b${base32(bytes)}`;
}
