import { getRadioTrack } from '$lib/api/appview';
import type { RadioTrack } from '$lib/api/types';
import { dev } from '$app/environment';

type RadioState = { did?: string; track?: RadioTrack; seenSlot?: string; open: boolean };
const state = $state<RadioState>({ open: false });
let requestId = 0;

function seenKey(did: string) {
	return `nagi-radio-seen:${did}`;
}
function readSeen(did: string): string | undefined {
	try {
		return localStorage.getItem(seenKey(did)) ?? undefined;
	} catch {
		return undefined;
	}
}

export const radio = {
	get track() {
		return state.track;
	},
	get open() {
		return state.open;
	},
	get isNew() {
		return Boolean(state.track && state.track.slotKey !== state.seenSlot);
	},
	async refresh(did: string) {
		if (state.did !== did) {
			state.did = did;
			state.track = undefined;
			state.seenSlot = readSeen(did);
			state.open = false;
		}
		const id = ++requestId;
		// UI確認用。開発環境の本人が ?radioPreview=1 で開いたときだけ、
			// 手動生成した本人向けの放送を表示する。公開ビルドには入らない。
		if (
			dev &&
			did === 'did:plc:uixgxpiqf4i63p6rgpu7ytmx' &&
			new URLSearchParams(window.location.search).get('radioPreview') === '1'
		) {
			state.track = {
				slotKey: '2026-09-23-20-preview',
				title: 'Rival!',
				artist: '松本梨香',
				comment:
					'今日は『超かぐや姫』の映像美に感動したんだね！山崎貴監督の作品も好きなら、きっとそのこだわりも伝わってくるはずだよ。他にもゲームや技術の話題、アキバへの憧れまでたくさんあって、すいばりの好奇心の幅広さがすごいね。そんなすいばりのパワーにぴったりの一曲は、ポケモンアニメのオープニングテーマである松本梨香の『Rival!』だよ。今日も素敵な一日を過ごしてね。',
				videoId: 'u4tIkGuByb8',
				publishedAt: '2026-09-23T12:00:00.000Z',
				sourceUrl: 'https://animethemes.moe/anime/pokemon',
			};
			return;
		}
		try {
			const result = await getRadioTrack();
			if (id === requestId && state.did === did) state.track = result.track;
		} catch (error) {
			// A temporary network or permission error should not erase a track already on screen.
			console.error('Failed to fetch bot-tan radio:', error);
		}
	},
	clear() {
		++requestId;
		state.did = undefined;
		state.track = undefined;
		state.seenSlot = undefined;
		state.open = false;
	},
	show() {
		if (!state.did || !state.track) return;
		state.open = true;
		state.seenSlot = state.track.slotKey;
		try {
			localStorage.setItem(seenKey(state.did), state.track.slotKey);
		} catch {
			/* ephemeral state still works */
		}
	},
	hide() {
		state.open = false;
	},
};
