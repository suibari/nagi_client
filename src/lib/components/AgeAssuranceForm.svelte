<script lang="ts">
	import { dateLocale, m } from '$lib/i18n/i18n.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import ToggleSwitch from './ToggleSwitch.svelte';
	import AgeConfirmDialog from './AgeConfirmDialog.svelte';
	import {
		ageAssurance,
		declareBirthDate,
		isAdultBirthDate,
		type DeclareResult,
	} from '$lib/moderation/age.svelte';

	let { onsaved }: { onsaved?: () => void } = $props();

	let birthDate = $state('');
	let parentalConsent = $state(false);
	let confirming = $state(false);
	let busy = $state(false);
	let error = $state('');

	// 18歳未満のときだけ保護者同意を訊く。日付が未入力のうちは出さない。
	let needsConsent = $derived(birthDate !== '' && !isAdultBirthDate(birthDate));
	let today = new Date().toISOString().slice(0, 10);

	/** "2008-09-02" を表示用に整形する。パースできない値はそのまま出す。 */
	function formatBirthDate(value: string): string {
		const date = new Date(`${value}T00:00:00Z`);
		if (Number.isNaN(date.getTime())) return value;
		return date.toLocaleDateString(dateLocale(), {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			timeZone: 'UTC',
		});
	}

	const errorText = (reason: Exclude<DeclareResult, { ok: true }>['reason']) =>
		reason === 'already_set'
			? m.ageErrorAlreadySet()
			: reason === 'consent_required'
				? m.ageErrorConsentRequired()
				: reason === 'invalid'
					? m.ageErrorInvalid()
					: m.ageErrorFailed();

	// 一度登録すると変更できないので、送信の前に必ず確認を挟む。
	function requestConfirm(event: SubmitEvent) {
		event.preventDefault();
		if (busy || !birthDate) return;
		error = '';
		confirming = true;
	}

	async function submit() {
		busy = true;
		error = '';
		const result = await declareBirthDate(birthDate, parentalConsent);
		busy = false;
		confirming = false;
		if (result.ok) onsaved?.();
		else error = errorText(result.reason);
	}
</script>

<!--
	年齢は AppView のアカウントに紐づくので、未ログインでは何も出さない。
	置き場所を増やしても安全なように、ガードは各ページではなくここに持たせる。
-->
{#if $session}
	<section class="age-assurance">
		<h2>{m.ageSectionTitle()}</h2>
		{#if ageAssurance.loading}
			<p class="note">…</p>
		{:else if ageAssurance.declared}
			<p class="note">{ageAssurance.isAdult ? m.ageDeclaredAdult() : m.ageDeclaredMinor()}</p>
			{#if ageAssurance.birthDate}
				<dl class="declared">
					<dt>{m.ageYourBirthDate()}</dt>
					<dd>{formatBirthDate(ageAssurance.birthDate)}</dd>
				</dl>
			{/if}
			<p class="note">{m.ageBirthDatePrivate()}</p>
		{:else}
			<p class="note">{m.ageUndeclared()}</p>
			<p class="note">{m.ageBirthDatePrivate()}</p>
			<form onsubmit={requestConfirm}>
				<label class="field">
					<span>{m.ageBirthDateLabel()}</span>
					<input type="date" bind:value={birthDate} max={today} required disabled={busy} />
				</label>
				<p class="note once">{m.ageOnceOnlyNote()}</p>
				{#if needsConsent}
					<ToggleSwitch
						checked={parentalConsent}
						label={m.ageParentalConsentLabel()}
						disabled={busy}
						onchange={(value) => (parentalConsent = value)}
					/>
				{/if}
				{#if error && !confirming}<p class="error" role="alert">{error}</p>{/if}
				<button class="login" type="submit" disabled={busy || !birthDate}>{m.ageSubmit()}</button>
			</form>
		{/if}
	</section>
{/if}

{#if confirming}
	<AgeConfirmDialog
		date={formatBirthDate(birthDate)}
		{busy}
		{error}
		onconfirm={() => void submit()}
		oncancel={() => (confirming = false)}
	/>
{/if}

<style>
	.age-assurance {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.note {
		color: var(--text-muted);
		font-size: 0.9rem;
	}
	.once {
		font-size: 0.8rem;
	}
	.declared {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.5rem;
		margin: 0;
	}
	.declared dt {
		color: var(--text-muted);
		font-size: 0.85rem;
	}
	.declared dd {
		margin: 0;
		font-weight: 700;
	}
	form {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.field span {
		font-size: 0.9rem;
	}
	.error {
		color: var(--danger, #c0392b);
		font-size: 0.9rem;
	}
</style>
