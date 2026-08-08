<script lang="ts">
	import { onMount } from 'svelte';
	import { getPreferences, putPreferences } from '$lib/api/appview';
	import { m } from '$lib/i18n/i18n.svelte';
	import { oauthReady, session } from '$lib/oauth/session.svelte';

	/** lexicon の maxGraphemes と揃えること（サーバ側も同じ値で弾く）。 */
	const MAX_LENGTH = 40;

	let loading = $state(true);
	let saving = $state(false);
	let error = $state('');
	let saved = $state(false);
	/** サーバに保存されている呼び名。空文字＝未設定（表示名で呼ばれる）。 */
	let current = $state('');
	let draft = $state('');

	let trimmed = $derived(draft.trim());
	let tooLong = $derived([...trimmed].length > MAX_LENGTH);
	let dirty = $derived(trimmed !== current);

	onMount(async () => {
		if (!$session) {
			loading = false;
			return;
		}
		try {
			const view = await getPreferences();
			current = view.preferredName ?? '';
			draft = current;
		} catch (e) {
			error = e instanceof Error ? e.message : m.botNameLoadFailed();
		} finally {
			loading = false;
		}
	});

	async function save(next: string) {
		if (saving) return;
		saving = true;
		error = '';
		saved = false;
		try {
			// 空文字を送ると登録を解除して表示名に戻る（サーバ側で行を消す）。
			const view = await putPreferences({ preferredName: next });
			current = view.preferredName ?? '';
			draft = current;
			saved = true;
		} catch (e) {
			error = e instanceof Error ? e.message : m.botNameSaveFailed();
		} finally {
			saving = false;
		}
	}
</script>

<section class="auth-card settings-detail bot-name-page">
	<a class="settings-back" href="/settings">← {m.backToSettings()}</a>
	<h1>{m.settingsBotNameTitle()}</h1>
	<p>{m.botNameHelp()}</p>

	{#if !$session && $oauthReady}
		<p>{m.botNameLoginRequired()}</p>
		<a class="login" href="/login">{m.login()}</a>
	{:else if $session}
		{#if loading}
			<p>{m.loading()}</p>
		{:else}
			<p class="bot-name-current">
				{current ? m.botNameCurrent({ name: current }) : m.botNameUnset()}
			</p>
			<label
				><span>{m.botNameLabel()}</span>
				<input
					bind:value={draft}
					maxlength={MAX_LENGTH * 3}
					autocomplete="off"
					placeholder={m.botNamePlaceholder()}
					disabled={saving}
				/></label
			>
			{#if tooLong}<p class="error" role="alert">{m.botNameTooLong({ max: MAX_LENGTH })}</p>{/if}
			<div class="bot-name-actions">
				<button disabled={!dirty || tooLong || !trimmed || saving} onclick={() => void save(trimmed)}>
					{saving ? m.botNameSaving() : m.save()}
				</button>
				{#if current}
					<button class="bot-name-clear" disabled={saving} onclick={() => void save('')}>
						{m.botNameClear()}
					</button>
				{/if}
			</div>
			{#if saved && !dirty}<p class="bot-name-saved" role="status">{m.botNameSaved()}</p>{/if}
		{/if}
	{/if}

	{#if error}<p class="error" role="alert">{error}</p>{/if}
</section>
