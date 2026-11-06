<script lang="ts">
	import { page } from '$app/state';
	import { isAuthorizationError, setPostMood } from '$lib/api/appview';
	import type { DiaryMoodView } from '$lib/api/types';
	import type { MoodDay } from '$lib/diary/mood';
	import {
		formatValence,
		MOOD_EDIT_VALUES,
		moodColor,
		moodGradient,
		moodPostAnchorId,
		moodSegmentStops,
		moodTimeLabel,
	} from '$lib/diary/mood';
	import { postPageHref } from '$lib/feed/post-follow.svelte';
	import { m, dateLocale } from '$lib/i18n/i18n.svelte';
	import { session, setOAuthReturnTo, signIn } from '$lib/oauth/session.svelte';
	import { grantedOptIns } from '$lib/optin/scope-optin';
	import Button from './Button.svelte';
	import PostModerationGuard from './PostModerationGuard.svelte';

	/**
	 * 1日ぶんの感情の点（投稿）を縦のタイムラインで並べる。感情グラフと月間アクティビティの詳細欄で使う。
	 * 左のレールは、各投稿の気分から次の投稿の気分へ補間したグラデーション（横バーと同じ考え方）。
	 * 時間の比率では並べず、長い空白（GAP_HOURS 以上）は行間を広げて「〜」で示す。
	 * preview（/about のサンプル）では投稿が実在しないのでリンクにしない。
	 *
	 * onchange を渡すと、値を押して直せる（botたんの読み取りが本人の解釈と違うことがあるため）。
	 * 保存できたら onchange で差し替えを親へ返す。next が無ければグラフから外れた点。
	 */
	let {
		date,
		day,
		preview = false,
		timeZone,
		onchange,
	}: {
		date: string;
		day?: MoodDay;
		preview?: boolean;
		/** 時刻の表示に使うタイムゾーン（横バーと揃える）。無ければ端末の時刻。 */
		timeZone?: string;
		onchange?: (uri: string, next: DiaryMoodView | undefined) => void;
	} = $props();

	const editable = $derived(Boolean(onchange) && !preview);
	let editing = $state<string | undefined>();
	let busy = $state(false);
	let error = $state('');
	let needsAuthorization = $state(false);

	const longDate = (value: string) =>
		new Date(`${value}T12:00:00`).toLocaleDateString(dateLocale(), {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	const timeLabel = (iso: string) => moodTimeLabel(iso, dateLocale(), timeZone);
	const tone = (value: number) => (value > 0 ? 'positive' : 'negative');
	const GAP_HOURS = 3;
	const isGap = (index: number) => {
		if (!day || index === 0) return false;
		const previous = new Date(day.points[index - 1].createdAt).getTime();
		const current = new Date(day.points[index].createdAt).getTime();
		return current - previous >= GAP_HOURS * 3_600_000;
	};
	const segment = (index: number) => {
		const next = day?.points[index + 1];
		if (!day || !next) return undefined;
		return moodGradient(moodSegmentStops(day.points[index].valence, next.valence), 'to bottom');
	};

	function toggle(uri: string) {
		if (busy) return;
		editing = editing === uri ? undefined : uri;
		error = '';
		needsAuthorization = false;
	}

	async function save(point: DiaryMoodView, valence: number | undefined) {
		if (busy || !onchange) return;
		if (valence !== undefined && valence === point.valence && point.edited) {
			editing = undefined;
			return;
		}
		busy = true;
		error = '';
		needsAuthorization = false;
		try {
			const result = await setPostMood({
				uri: point.uri,
				...(valence === undefined ? {} : { valence }),
			});
			onchange(point.uri, result.mood);
			editing = undefined;
		} catch (cause) {
			if (isAuthorizationError(cause)) needsAuthorization = true;
			else error = m.moodEditFailed();
		} finally {
			busy = false;
		}
	}

	async function reauthorize() {
		if (!$session || busy) return;
		busy = true;
		setOAuthReturnTo(`${page.url.pathname}${page.url.search}`);
		try {
			await signIn($session.did, { ...(await grantedOptIns()), refreshPermissions: true });
		} catch {
			error = m.moodEditFailed();
		} finally {
			busy = false;
		}
	}
</script>

<section class="mood-day" aria-label={longDate(date)}>
	{#if day}
		<ol>
			{#each day.points as point, index (point.uri)}
				{@const rail = segment(index)}
				<li
					id={moodPostAnchorId(point.uri)}
					class:gap={isGap(index)}
					class:editing={editable && editing === point.uri}
					tabindex="-1"
				>
					<span class="rail" aria-hidden="true">
						{#if isGap(index)}<span class="rail-gap">〜</span>{/if}
						{#if rail}<span class="rail-line" style:background={rail}></span>{/if}
						<span class="rail-dot" style:background={moodColor(point.valence)}></span>
					</span>
					{#if editable}
						<button
							type="button"
							class={`mood-chip mood-chip--${tone(point.valence)}`}
							class:mood-chip--edited={point.edited}
							aria-expanded={editing === point.uri}
							aria-label={m.moodEditOpen({ value: formatValence(point.valence) })}
							onclick={() => toggle(point.uri)}>{formatValence(point.valence)}</button
						>
					{:else}
						<span
							class={`mood-chip mood-chip--${tone(point.valence)}`}
							class:mood-chip--edited={point.edited}>{formatValence(point.valence)}</span
						>
					{/if}
					{#if preview}
						<span class="mood-post">
							<time datetime={point.createdAt}>{timeLabel(point.createdAt)}</time>
							<span class="mood-text">{point.text}</span>
						</span>
					{:else}
						<a class="mood-post" href={postPageHref(point)}>
							<span class="mood-meta">
								<time datetime={point.createdAt}>{timeLabel(point.createdAt)}</time>
								{#if point.edited}<span class="mood-edited">{m.moodEdited()}</span>{/if}
							</span>
							<PostModerationGuard post={point}>
								<span class="mood-text">{point.text}</span>
							</PostModerationGuard>
						</a>
					{/if}
					{#if editable && editing === point.uri}
						<div class="mood-editor" role="group" aria-label={m.moodEditAria()}>
							<p class="mood-editor-hint">{m.moodEditHint()}</p>
							<div class="mood-scale">
								{#each MOOD_EDIT_VALUES as value (value)}
									<button
										type="button"
										class={`mood-option mood-option--${tone(value)}`}
										aria-pressed={point.valence === value}
										disabled={busy}
										onclick={() => save(point, value)}>{formatValence(value)}</button
									>
								{/each}
							</div>
							{#if needsAuthorization}
								<p class="mood-editor-error" role="alert">{m.moodEditAuthorizationNeeded()}</p>
							{:else if error}
								<p class="mood-editor-error" role="alert">{error}</p>
							{/if}
							<div class="mood-editor-actions">
								{#if needsAuthorization}
									<Button variant="primary" size="sm" disabled={busy} onclick={reauthorize}
										>{m.zenkatsuReauthorize()}</Button
									>
								{:else if point.edited}
									<Button
										variant="ghost"
										size="sm"
										disabled={busy}
										onclick={() => save(point, undefined)}>{m.moodEditRevert()}</Button
									>
								{/if}
								<Button
									variant="secondary"
									size="sm"
									disabled={busy}
									onclick={() => toggle(point.uri)}>{m.moodEditClose()}</Button
								>
							</div>
						</div>
					{/if}
				</li>
			{/each}
		</ol>
	{:else}
		<p class="mood-hint">{m.moodDayNoPosts()}</p>
	{/if}
</section>

<style>
	.mood-hint {
		font-size: 12px;
		color: var(--text-faint);
	}
	.mood-day ol {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
	}
	.mood-day li {
		--dot-top: 14px;
		display: grid;
		grid-template-columns: 12px 38px 1fr;
		gap: 10px;
		align-items: start;
		padding: 8px 0;
		border-radius: var(--radius-m);
		outline: none;
		scroll-margin-block: 96px;
	}
	.mood-day li.gap {
		padding-block-start: 26px;
		--dot-top: 32px;
	}
	.mood-day li:global([data-flash]) {
		animation: mood-flash 1.6s ease-out;
	}
	@keyframes mood-flash {
		from {
			background: var(--accent-weak);
		}
		to {
			background: transparent;
		}
	}
	.rail {
		position: relative;
		align-self: stretch;
		margin-block: -8px;
	}
	.mood-day li.editing .rail {
		grid-row: span 2;
	}
	.mood-day li.gap .rail {
		margin-block-start: -26px;
	}
	.rail-dot {
		position: absolute;
		inset-block-start: var(--dot-top);
		inset-inline-start: 50%;
		inline-size: 10px;
		block-size: 10px;
		border-radius: 50%;
		box-shadow: 0 0 0 2px var(--bg-raised);
		transform: translate(-50%, -50%);
	}
	/* 自分の点から次の行の点まで伸ばす。次の行の点は、この行の下端 + 次の行の --dot-top。 */
	.rail-line {
		position: absolute;
		inset-block-start: var(--dot-top);
		inset-block-end: calc(-1 * var(--next-dot-top, 14px));
		inset-inline-start: 50%;
		inline-size: 4px;
		border-radius: 2px;
		transform: translateX(-50%);
	}
	.mood-day li:has(+ li.gap) {
		--next-dot-top: 32px;
	}
	.rail-gap {
		position: absolute;
		inset-block-start: 4px;
		inset-inline-start: calc(100% + 10px);
		font-size: 11px;
		line-height: 1;
		color: var(--text-faint);
	}
	.mood-post {
		display: grid;
		gap: 2px;
		min-inline-size: 0;
		color: inherit;
		text-decoration: none;
	}
	a.mood-post:hover .mood-text {
		text-decoration: underline;
	}
	.mood-meta {
		display: flex;
		align-items: baseline;
		gap: 6px;
	}
	.mood-day time {
		font-size: 11px;
		color: var(--text-faint);
	}
	.mood-edited {
		font-size: 11px;
		color: var(--text-muted);
	}
	.mood-text {
		font-size: 13px;
		color: var(--text);
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.mood-chip {
		text-align: center;
		font: inherit;
		font-size: 12px;
		font-weight: 800;
		font-variant-numeric: tabular-nums;
		border: 1.5px solid currentColor;
		border-radius: var(--radius-pill);
		padding: 1px 0;
		background: transparent;
	}
	button.mood-chip {
		cursor: pointer;
	}
	button.mood-chip:focus-visible,
	.mood-option:focus-visible {
		outline: 2px solid var(--accent-strong);
		outline-offset: 2px;
	}
	.mood-chip--positive {
		color: var(--mood-positive);
	}
	.mood-chip--negative {
		color: var(--mood-negative);
	}
	/* 本人が直した値は塗りにして、botたんの読み取り（枠だけ）と見分ける。 */
	.mood-chip--positive.mood-chip--edited {
		background: var(--mood-positive);
		border-color: var(--mood-positive);
		color: var(--bg);
	}
	.mood-chip--negative.mood-chip--edited {
		background: var(--mood-negative);
		border-color: var(--mood-negative);
		color: var(--bg);
	}

	.mood-editor {
		grid-column: 2 / -1;
		display: grid;
		gap: 8px;
		padding: 10px;
		border: 1px solid var(--line);
		border-radius: var(--radius-m);
	}
	.mood-editor-hint {
		margin: 0;
		font-size: 12px;
		color: var(--text-faint);
	}
	.mood-scale {
		display: grid;
		grid-template-columns: repeat(10, minmax(0, 1fr));
		gap: 4px;
	}
	.mood-option {
		font: inherit;
		font-size: 12px;
		font-weight: 800;
		font-variant-numeric: tabular-nums;
		min-block-size: 32px;
		padding: 0;
		border: 1.5px solid currentColor;
		border-radius: var(--radius-pill);
		background: transparent;
		cursor: pointer;
	}
	.mood-option--positive {
		color: var(--mood-positive);
	}
	.mood-option--negative {
		color: var(--mood-negative);
	}
	.mood-option--positive[aria-pressed='true'] {
		background: var(--mood-positive);
		color: var(--bg);
	}
	.mood-option--negative[aria-pressed='true'] {
		background: var(--mood-negative);
		color: var(--bg);
	}
	.mood-option:disabled {
		cursor: default;
		opacity: 0.6;
	}
	.mood-editor-error {
		margin: 0;
		font-size: 12px;
		color: var(--danger);
	}
	.mood-editor-actions {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
	}
</style>
