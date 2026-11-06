<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { onMount } from 'svelte';
	import { getPreferences, putPreferences } from '$lib/api/appview';
	import type { DiaryDayPreferences } from '$lib/api/types';
	import { deviceTimezone } from '$lib/diary/timezone';
	import { dateLocale, m } from '$lib/i18n/i18n.svelte';
	import { oauthReady, session } from '$lib/oauth/session.svelte';
	import SignedOutNotice from '$lib/components/SignedOutNotice.svelte';
	import SettingRow from '$lib/components/SettingRow.svelte';
	import SettingsPage from '$lib/components/SettingsPage.svelte';
	import SettingsSection from '$lib/components/SettingsSection.svelte';

	/** 選べる区切り（夕方から翌朝の順）。AppView の DIARY_DAY_START_HOURS と同じ。 */
	const START_HOURS = [18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6];
	const DEFAULT_START_HOUR = 22;
	const AUTO = 'auto';

	let loading = $state(true);
	let saving = $state(false);
	let error = $state('');
	let saved = $state(false);
	/** 旧 AppView は diaryDay を返さない。そのときは項目を出さない。 */
	let unavailable = $state(false);
	let prefs = $state<DiaryDayPreferences>();
	let draftZone = $state(AUTO);
	let draftHour = $state(DEFAULT_START_HOUR);

	const device = deviceTimezone();
	const savedZone = $derived(prefs?.manualTimezone ?? AUTO);
	const dirty = $derived(
		Boolean(prefs) && (draftZone !== savedZone || draftHour !== prefs?.startHour),
	);

	/** 選べるタイムゾーン。今の値が一覧に無くても選択肢に残す。 */
	const zones = $derived.by(() => {
		let list: string[] = [];
		try {
			list = Intl.supportedValuesOf('timeZone');
		} catch {
			list = [];
		}
		const extra = [prefs?.manualTimezone, prefs?.current.timezone, device].filter(
			(zone): zone is string => Boolean(zone) && !list.includes(zone!),
		);
		return [...new Set([...extra, ...list])].sort();
	});

	const timeLabel = (hour: number) =>
		new Date(2000, 0, 1, hour).toLocaleTimeString(dateLocale(), {
			hour: '2-digit',
			minute: '2-digit',
		});
	const hourOption = (hour: number) => {
		const time = timeLabel(hour);
		if (hour === DEFAULT_START_HOUR) return m.diaryDayHourDefault({ time });
		return hour < 12 ? m.diaryDayHourNextDay({ time }) : time;
	};
	const longDate = (value: string) =>
		new Date(`${value}T12:00:00`).toLocaleDateString(dateLocale(), {
			month: 'long',
			day: 'numeric',
		});

	/**
	 * 「◯月◯日の日記から反映されます」。予約中の変更があればその日。保存した直後は、
	 * 今開いている日から有効になった場合もその日を出す（まだその日の日記は書かれていない）。
	 */
	const effectiveFrom = $derived(
		prefs?.pending?.effectiveFrom ?? (saved ? prefs?.current.effectiveFrom : undefined),
	);

	function apply(next: DiaryDayPreferences | undefined) {
		prefs = next;
		unavailable = !next;
		draftZone = next?.manualTimezone ?? AUTO;
		draftHour = next?.startHour ?? DEFAULT_START_HOUR;
	}

	onMount(async () => {
		if (!$session) {
			loading = false;
			return;
		}
		try {
			apply((await getPreferences()).diaryDay);
		} catch (e) {
			error = e instanceof Error ? e.message : m.diaryDayLoadFailed();
		} finally {
			loading = false;
		}
	});

	async function save() {
		if (saving || !dirty) return;
		saving = true;
		error = '';
		saved = false;
		try {
			const view = await putPreferences({
				diaryDay: {
					timezone: draftZone === AUTO ? null : draftZone,
					startHour: draftHour,
				},
				// 自動に戻したときは、この端末の値もすぐ伝える（次に開くのを待たない）。
				...(draftZone === AUTO && device ? { detectedTimezone: device } : {}),
			});
			apply(view.diaryDay);
			saved = true;
		} catch (e) {
			error = e instanceof Error ? e.message : m.diaryDaySaveFailed();
		} finally {
			saving = false;
		}
	}
</script>

<SettingsPage title={m.settingsBotDiaryDayTitle()}>
	{#if !$session && $oauthReady}
		<SignedOutNotice message={m.diaryDayLoginRequired()} />
	{:else if $session}
		{#if loading}
			<Spinner />
		{:else if unavailable}
			<p class="settings-status">{m.diaryDayUnavailable()}</p>
		{:else if prefs}
			<SettingsSection description={m.diaryDayHelp()}>
				<SettingRow label={m.diaryDayTimezoneLabel()} description={m.diaryDayTimezoneHelp()}>
					{#snippet control({ labelId, descriptionId })}
						<select
							class="settings-select"
							bind:value={draftZone}
							disabled={saving}
							aria-labelledby={labelId}
							aria-describedby={descriptionId}
						>
							<option value={AUTO}
								>{device
									? m.diaryDayTimezoneAuto({ zone: device })
									: m.diaryDayTimezoneAutoUnknown()}</option
							>
							{#each zones as zone (zone)}<option value={zone}>{zone}</option>{/each}
						</select>
					{/snippet}
				</SettingRow>
				<SettingRow label={m.diaryDayStartHourLabel()} description={m.diaryDayStartHourHelp()}>
					{#snippet control({ labelId, descriptionId })}
						<select
							class="settings-select"
							bind:value={draftHour}
							disabled={saving}
							aria-labelledby={labelId}
							aria-describedby={descriptionId}
						>
							{#each START_HOURS as hour (hour)}<option value={hour}>{hourOption(hour)}</option
								>{/each}
						</select>
					{/snippet}
				</SettingRow>
			</SettingsSection>
			<p class="diary-day-current">
				{m.diaryDayCurrent({
					zone: prefs.current.timezone,
					time: timeLabel(prefs.current.startHour),
				})}
				{#if effectiveFrom}
					{m.diaryDayEffectiveFrom({ date: longDate(effectiveFrom) })}
				{/if}
			</p>
			<div class="settings-actions">
				<Button variant="primary" disabled={!dirty || saving} onclick={() => void save()}>
					{saving ? m.diaryDaySaving() : m.save()}
				</Button>
				{#if saved && !dirty}
					<p class="settings-status" role="status">{m.diaryDaySaved()}</p>
				{/if}
			</div>
		{/if}
	{/if}

	{#if error}
		<p class="settings-error" role="alert">{error}</p>
	{/if}
</SettingsPage>

<style>
	.diary-day-current {
		margin: 0;
		color: var(--text-muted);
		font-size: 0.85rem;
		line-height: 1.6;
	}
</style>
