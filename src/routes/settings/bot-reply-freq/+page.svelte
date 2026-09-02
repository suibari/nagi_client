<script lang="ts">
	import { onMount } from 'svelte';
	import { getPreferences, putPreferences } from '$lib/api/appview';
	import { m } from '$lib/i18n/i18n.svelte';
	import { oauthReady, session } from '$lib/oauth/session.svelte';
	import SignedOutNotice from '$lib/components/SignedOutNotice.svelte';

	let loading = $state(true);
	let saving = $state(false);
	let error = $state('');
	let saved = $state(false);

	/** サーバに保存されている返信確率（0〜100、デフォルト100）。 */
	let currentFreq = $state(100);
	let draftFreq = $state(100);

	let dirty = $derived(draftFreq !== currentFreq);

	onMount(async () => {
		if (!$session) {
			loading = false;
			return;
		}
		try {
			const view = await getPreferences();
			currentFreq = view.replyFreq ?? 100;
			draftFreq = currentFreq;
		} catch (e) {
			error = e instanceof Error ? e.message : m.botReplyFreqLoadFailed();
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
			const view = await putPreferences({ replyFreq: draftFreq });
			currentFreq = view.replyFreq ?? 100;
			draftFreq = currentFreq;
			saved = true;
		} catch (e) {
			error = e instanceof Error ? e.message : m.botReplyFreqSaveFailed();
		} finally {
			saving = false;
		}
	}
</script>

<section class="auth-card settings-detail bot-reply-freq-page">
	<a class="settings-back" href="/settings">← {m.backToSettings()}</a>
	<h1>{m.settingsBotReplyFreqTitle()}</h1>
	<p>{m.botReplyFreqHelp()}</p>

	{#if !$session && $oauthReady}
		<SignedOutNotice message={m.botReplyFreqLoginRequired()} />
	{:else if $session}
		{#if loading}
			<p>{m.loading()}</p>
		{:else}
			<div class="bot-reply-freq-container">
				<p class="bot-reply-freq-current">
					{m.botReplyFreqCurrent({ freq: draftFreq })}
				</p>
				<div class="bot-reply-freq-slider-wrapper">
					<label for="bot-reply-freq-range" class="sr-only">{m.botReplyFreqLabel()}</label>
					<input
						id="bot-reply-freq-range"
						type="range"
						min="0"
						max="100"
						step="1"
						bind:value={draftFreq}
						disabled={saving}
						class="bot-reply-freq-slider"
					/>
					<div class="bot-reply-freq-labels">
						<span>0%</span>
						<span>50%</span>
						<span>100%</span>
					</div>
				</div>
				<div class="bot-reply-freq-actions">
					<button disabled={!dirty || saving} onclick={() => void save()}>
						{saving ? m.botReplyFreqSaving() : m.save()}
					</button>
				</div>
				{#if saved && !dirty}
					<p class="bot-reply-freq-saved" role="status">{m.botReplyFreqSaved()}</p>
				{/if}
			</div>
		{/if}
	{/if}

	{#if error}
		<p class="error" role="alert">{error}</p>
	{/if}
</section>
