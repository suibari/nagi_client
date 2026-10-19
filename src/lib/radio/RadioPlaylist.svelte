<script lang="ts">
	import type { RadioTrack } from '$lib/api/types';
	import { i18n, m } from '$lib/i18n/i18n.svelte';
	import { radioSongCard } from './song-card';

	/**
	 * ラジオ履歴を「DJブース＋レコード棚」で見せる。
	 *
	 * 1曲ごとにコメント全文を並べると画面が文字で埋まるので、コメントはブースの吹き出し1か所だけに出す。
	 * 棚のジャケットにホバー（またはフォーカス）するとその曲を試聴するように吹き出しが切り替わり、
	 * クリックで針を落とす（固定する）。指を離すと固定中の曲に戻る。最初は最新の曲に針が乗っている。
	 */
	let { tracks, unreadSlotKey }: { tracks: RadioTrack[]; unreadSlotKey?: string } = $props();

	const ja = $derived(i18n.locale === 'ja');
	const locale = $derived(ja ? 'ja-JP' : 'en-US');

	let pinned = $state<string>();
	let previewing = $state<string>();
	const current = $derived(tracks.find((t) => t.slotKey === (previewing ?? pinned)) ?? tracks[0]);
	const currentLink = $derived(current ? radioSongCard(current) : null);

	/** 放送は日本時間で区切っているので、日付の束ねも日本時間で行う。 */
	const dayKey = (iso: string) =>
		new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo', dateStyle: 'short' }).format(
			new Date(iso),
		);
	const days = $derived.by(() => {
		const groups: { key: string; tracks: RadioTrack[] }[] = [];
		for (const track of tracks) {
			const key = dayKey(track.publishedAt);
			const last = groups.at(-1);
			if (last?.key === key) last.tracks.push(track);
			else groups.push({ key, tracks: [track] });
		}
		return groups;
	});
	const dayLabel = (iso: string) =>
		new Intl.DateTimeFormat(locale, {
			timeZone: 'Asia/Tokyo',
			month: 'long',
			day: 'numeric',
			weekday: 'short',
		}).format(new Date(iso));
	const timeLabel = (iso: string) =>
		new Intl.DateTimeFormat(locale, {
			timeZone: 'Asia/Tokyo',
			hour: '2-digit',
			minute: '2-digit',
		}).format(new Date(iso));
	const comment = (track: RadioTrack) =>
		(i18n.locale === 'en' ? track.commentEn : track.commentJa) || track.comment;

	/** ジャケットが無い曲は、曲名から決まる色のスリーブを作る（同じ曲はいつも同じ色）。 */
	function sleeveHue(track: RadioTrack) {
		let hash = 2166136261;
		for (const char of track.title + track.artist)
			hash = Math.imul(hash ^ char.codePointAt(0)!, 16777619);
		return (hash >>> 0) % 360;
	}
	const jacket = (track: RadioTrack) => radioSongCard(track)?.thumb;

	function pin(track: RadioTrack) {
		pinned = track.slotKey;
	}
	function leave(track: RadioTrack) {
		if (previewing === track.slotKey) previewing = undefined;
	}
</script>

{#if current}
	<div class="station">
		<aside class="booth" aria-live="polite">
			<div class="deck" aria-hidden="true">
				{#key current.slotKey}
					<div class="platter">
						<div class="vinyl" style:--hue={sleeveHue(current)}>
							{#if jacket(current)}
								<img class="label" src={jacket(current)} alt="" loading="lazy" />
							{:else}
								<span class="label label-fallback">♪</span>
							{/if}
						</div>
					</div>
				{/key}
				<span class="arm"></span>
			</div>
			<div class="dj">
				<img class="dj-face" src="/bot_dj_laugh.webp" alt="" width="56" height="56" />
				<div class="bubble">
					<p class="on-air">
						<span class="lamp"></span>{m.radioOnAir()}
						<time datetime={current.publishedAt}>
							{dayLabel(current.publishedAt)}
							{timeLabel(current.publishedAt)}
						</time>
					</p>
					<p class="now-title">
						<strong>{current.title}</strong>
						<span>{current.artist}</span>
					</p>
					<p class="comment">{comment(current)}</p>
					{#if currentLink}
						<a class="listen" href={currentLink.uri} target="_blank" rel="noopener noreferrer">
							{m.radioListen()} ↗
						</a>
					{/if}
				</div>
			</div>
		</aside>

		<p class="hint">{m.radioBoothHint()}</p>

		<div class="crate" role="list" aria-label={m.radioPlaylistAria()}>
			{#each days as day (day.key)}
				<div class="day" role="listitem">
					<h2 class="tape">
						<span>{dayLabel(day.tracks[0].publishedAt)}</span>
						<small>{m.radioTrackCount({ n: day.tracks.length })}</small>
					</h2>
					<ul class="sleeves">
						{#each day.tracks as track (track.slotKey)}
							<li>
								<button
									type="button"
									class="sleeve"
									class:playing={current.slotKey === track.slotKey}
									aria-pressed={current.slotKey === track.slotKey}
									style:--hue={sleeveHue(track)}
									onmouseenter={() => (previewing = track.slotKey)}
									onmouseleave={() => leave(track)}
									onfocus={() => (previewing = track.slotKey)}
									onblur={() => leave(track)}
									onclick={() => pin(track)}
								>
									<span class="record" aria-hidden="true"></span>
									<span class="cover">
										{#if jacket(track)}
											<img src={jacket(track)} alt="" loading="lazy" />
										{:else}
											<span class="cover-fallback" aria-hidden="true">
												{[...track.title][0] ?? '♪'}
											</span>
										{/if}
										{#if track.slotKey === unreadSlotKey}
											<span class="sticker">{m.radioNew()}</span>
										{/if}
										<span class="eq" aria-hidden="true"><i></i><i></i><i></i></span>
									</span>
									<span class="sleeve-title">{track.title}</span>
									<span class="sleeve-artist">
										{track.artist}
										<time datetime={track.publishedAt}>{timeLabel(track.publishedAt)}</time>
									</span>
								</button>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	</div>
{/if}

<style>
	.station {
		display: grid;
		gap: 12px;
		min-width: 0;
		/* スリーブから顔を出すレコードが画面の外へはみ出さないように。clip ならブースの sticky は効いたまま。 */
		overflow-x: clip;
	}

	/* --- DJブース --- */
	.booth {
		position: sticky;
		top: 8px;
		z-index: 2;
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: start;
		gap: 14px;
		padding: 14px;
		border: 1px solid var(--line);
		border-radius: 20px;
		background:
			radial-gradient(circle at 0% 0%, var(--accent-softer), transparent 55%), var(--surface-1);
		box-shadow: var(--shadow-panel);
	}
	@media (max-width: 767px) {
		.booth {
			top: calc(var(--mobile-header-h) + 6px);
			gap: 10px;
			padding: 10px;
		}
	}
	.deck {
		position: relative;
		inline-size: 112px;
		block-size: 112px;
		border-radius: 14px;
		background: linear-gradient(145deg, var(--bg-inset), var(--surface-2));
		box-shadow: inset 0 0 0 1px var(--line);
	}
	.platter {
		position: absolute;
		inset: 8px;
		animation: drop 0.35s ease-out;
	}
	/* 溝を同心円の縞で描く。ラベルの色は曲ごとに変わる。 */
	.vinyl {
		display: grid;
		place-items: center;
		block-size: 100%;
		border-radius: 50%;
		background: repeating-radial-gradient(circle, #1c1c1f 0 2px, #26262b 2px 3px), #1c1c1f;
		box-shadow: 0 2px 6px rgb(0 0 0 / 0.35);
		animation: spin 6s linear infinite;
	}
	.label {
		inline-size: 44%;
		block-size: 44%;
		border-radius: 50%;
		object-fit: cover;
		box-shadow: 0 0 0 2px #111;
	}
	.label-fallback {
		display: grid;
		place-items: center;
		background: hsl(var(--hue) 70% 62%);
		color: white;
		font-weight: 800;
	}
	.arm {
		position: absolute;
		inset-block-start: 6px;
		inset-inline-end: 8px;
		inline-size: 4px;
		block-size: 64px;
		border-radius: 4px;
		background: linear-gradient(var(--text-faint), var(--line-strong));
		transform: rotate(24deg);
		transform-origin: 50% 4px;
	}
	.arm::before {
		position: absolute;
		inset-block-start: -4px;
		inset-inline-start: -4px;
		inline-size: 12px;
		block-size: 12px;
		border-radius: 50%;
		background: var(--text-faint);
		content: '';
	}
	.dj {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: start;
		gap: 8px;
		min-width: 0;
	}
	.dj-face {
		inline-size: 48px;
		block-size: 48px;
		border-radius: 50%;
		background: var(--accent-softer);
		object-fit: cover;
		image-rendering: pixelated;
	}
	.bubble p {
		margin: 0;
	}
	.bubble {
		position: relative;
		display: grid;
		gap: 4px;
		min-width: 0;
		padding: 10px 12px;
		border: 1px solid var(--bubble-bot-border);
		border-radius: 4px 16px 16px 16px;
		background: var(--bubble-bot-bg);
	}
	.on-air {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px 8px;
		color: var(--danger);
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.08em;
	}
	.on-air time {
		color: var(--text-muted);
		white-space: nowrap;
		font-weight: 400;
		letter-spacing: 0;
	}
	.lamp {
		inline-size: 7px;
		block-size: 7px;
		border-radius: 50%;
		background: var(--danger);
		box-shadow: 0 0 0 3px var(--danger-soft);
		animation: blink 1.6s ease-in-out infinite;
	}
	.now-title {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0 8px;
		overflow-wrap: anywhere;
	}
	.now-title strong {
		font-size: 15px;
	}
	.now-title span {
		color: var(--text-muted);
		font-size: 12px;
	}
	/* 吹き出しは一定の高さに収め、長いコメントだけ中でスクロールさせる（ブースが画面を覆わないように）。 */
	.comment {
		max-block-size: 7.5em;
		overflow-y: auto;
		font-size: 13px;
		line-height: 1.65;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
	@media (max-width: 767px) {
		.deck {
			inline-size: 76px;
			block-size: 76px;
		}
		.platter {
			inset: 6px;
		}
		.arm {
			block-size: 42px;
		}
		.dj {
			grid-template-columns: minmax(0, 1fr);
		}
		.dj-face {
			display: none;
		}
		.comment {
			max-block-size: 5em;
		}
	}
	.listen {
		justify-self: start;
		color: var(--accent-strong);
		font-size: 12px;
		font-weight: 700;
	}
	.hint {
		margin: 0;
		color: var(--text-muted);
		font-size: 12px;
		text-align: center;
	}

	/* --- レコード棚 --- */
	.crate {
		display: grid;
		gap: 18px;
	}
	/* カセットのラベル風の日付見出し。 */
	.tape {
		display: flex;
		align-items: baseline;
		gap: 8px;
		margin-block-end: 8px;
		padding: 4px 10px;
		border-inline-start: 4px solid var(--accent);
		border-radius: 4px;
		background: var(--bg-inset);
		font-size: 13px;
	}
	.tape small {
		color: var(--text-muted);
		font-size: 11px;
		font-weight: 400;
	}
	.sleeves {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(118px, 1fr));
		gap: 14px 12px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	@media (max-width: 767px) {
		.sleeves {
			grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
		}
	}
	.sleeve {
		position: relative;
		display: grid;
		gap: 2px;
		inline-size: 100%;
		padding: 0;
		border: 0;
		background: none;
		color: var(--text);
		font: inherit;
		text-align: start;
		cursor: pointer;
	}
	.sleeve:focus-visible {
		outline: 3px solid var(--accent-strong);
		outline-offset: 4px;
		border-radius: 10px;
	}
	.cover {
		position: relative;
		z-index: 1;
		display: block;
		aspect-ratio: 1;
		overflow: hidden;
		border-radius: 8px;
		background: linear-gradient(
			135deg,
			hsl(var(--hue) 75% 70%),
			hsl(calc(var(--hue) + 50) 70% 45%)
		);
		box-shadow:
			0 1px 0 rgb(255 255 255 / 0.3) inset,
			0 4px 10px rgb(0 0 0 / 0.18);
		transition: transform 0.2s ease;
	}
	.cover img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}
	.cover-fallback {
		display: grid;
		place-items: center;
		block-size: 100%;
		color: rgb(255 255 255 / 0.92);
		font-size: 40px;
		font-weight: 800;
		text-shadow: 0 2px 8px rgb(0 0 0 / 0.25);
	}
	/* スリーブの後ろに隠れたレコード。ホバーや再生中にすっと顔を出す。 */
	.record {
		position: absolute;
		inset-block-start: 4%;
		inset-inline-start: 4%;
		inline-size: 92%;
		aspect-ratio: 1;
		border-radius: 50%;
		background:
			radial-gradient(circle, hsl(var(--hue) 70% 60%) 0 16%, #111 17% 19%, transparent 20%),
			repeating-radial-gradient(circle, #1c1c1f 0 2px, #2a2a2f 2px 3px);
		transition: transform 0.3s ease;
	}
	.sleeve:hover .record,
	.sleeve:focus-visible .record,
	.sleeve.playing .record {
		transform: translateX(22%) rotate(40deg);
	}
	.sleeve:hover .cover,
	.sleeve:focus-visible .cover {
		transform: translateX(-4%);
	}
	.sleeve.playing .cover {
		box-shadow:
			0 0 0 3px var(--accent),
			0 6px 14px rgb(0 0 0 / 0.22);
	}
	.sleeve-title {
		margin-block-start: 6px;
		overflow: hidden;
		font-size: 13px;
		font-weight: 700;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.sleeve-artist {
		display: flex;
		justify-content: space-between;
		gap: 6px;
		overflow: hidden;
		color: var(--text-muted);
		font-size: 11px;
		white-space: nowrap;
	}
	.sleeve-artist time {
		flex: 0 0 auto;
		font-variant-numeric: tabular-nums;
	}
	.sticker {
		position: absolute;
		inset-block-start: 6px;
		inset-inline-start: 6px;
		padding: 2px 7px;
		border-radius: 999px;
		background: var(--danger);
		color: white;
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.06em;
		transform: rotate(-8deg);
	}
	/* 再生中のスリーブにだけ出るイコライザー。 */
	.eq {
		position: absolute;
		inset-block-end: 6px;
		inset-inline-end: 6px;
		display: none;
		align-items: flex-end;
		gap: 2px;
		block-size: 16px;
		padding: 3px 4px;
		border-radius: 4px;
		background: rgb(0 0 0 / 0.55);
	}
	.sleeve.playing .eq {
		display: flex;
	}
	.eq i {
		inline-size: 3px;
		background: white;
		animation: eq 0.9s ease-in-out infinite alternate;
	}
	.eq i:nth-child(2) {
		animation-delay: -0.3s;
	}
	.eq i:nth-child(3) {
		animation-delay: -0.6s;
	}

	@keyframes spin {
		to {
			transform: rotate(1turn);
		}
	}
	@keyframes drop {
		from {
			opacity: 0;
			transform: scale(0.85) rotate(-20deg);
		}
	}
	@keyframes blink {
		50% {
			opacity: 0.35;
		}
	}
	@keyframes eq {
		from {
			block-size: 20%;
		}
		to {
			block-size: 100%;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.vinyl,
		.platter,
		.lamp,
		.eq i {
			animation: none;
		}
		.eq i {
			block-size: 60%;
		}
		.record,
		.cover {
			transition: none;
		}
	}
</style>
