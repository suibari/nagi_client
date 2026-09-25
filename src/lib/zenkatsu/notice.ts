import { writable } from 'svelte/store';
import { getZenkatsu } from '$lib/api/appview';
import { session } from '$lib/oauth/session.svelte';

/** JST の午前4時を境にしたプレイ日。 */
export function playDay(now = Date.now()): string {
	return new Date(now + 5 * 60 * 60_000).toISOString().slice(0, 10);
}

export const unplayedToday = writable(0);
let did: string | undefined;
let day = '';
let request = 0;
let locallyPlayedDay = '';

export function markZenkatsuPlayed(themeDate: string): void {
	if (themeDate !== playDay()) return;
	locallyPlayedDay = themeDate;
	request++;
	unplayedToday.set(0);
}

export function updateZenkatsuNotice(
	viewerDid: string,
	themeDate: string,
	submitted: boolean,
): void {
	if (viewerDid !== did || themeDate !== playDay()) return;
	request++;
	unplayedToday.set(submitted || locallyPlayedDay === themeDate ? 0 : 1);
}

export function startZenkatsuNotice(): () => void {
	async function refresh() {
		const currentDid = did;
		const currentDay = playDay();
		if (!currentDid) return;
		if (day !== currentDay) {
			day = currentDay;
			locallyPlayedDay = '';
			unplayedToday.set(0);
		}
		const version = ++request;
		try {
			const feed = await getZenkatsu({}, { requireViewer: true });
			if (version !== request || did !== currentDid || playDay() !== currentDay) return;
			if (feed.viewer && feed.theme.themeDate === currentDay)
				unplayedToday.set(feed.viewer.submitted || locallyPlayedDay === currentDay ? 0 : 1);
		} catch {
			// 認証や通信に失敗した状態で未プレイと断定しない。
		}
	}
	const unsubscribe = session.subscribe((value) => {
		if (did === value?.did) return;
		did = value?.did;
		day = playDay();
		locallyPlayedDay = '';
		request++;
		unplayedToday.set(0);
		void refresh();
	});
	const onVisible = () => {
		if (!document.hidden) void refresh();
	};
	document.addEventListener('visibilitychange', onVisible);
	return () => {
		unsubscribe();
		did = undefined;
		unplayedToday.set(0);
		document.removeEventListener('visibilitychange', onVisible);
		request++;
	};
}
