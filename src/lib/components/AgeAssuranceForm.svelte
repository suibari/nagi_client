<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';
	import ToggleSwitch from './ToggleSwitch.svelte';
	import {
		ageAssurance,
		declareBirthDate,
		isAdultBirthDate,
		type DeclareResult,
	} from '$lib/moderation/age.svelte';

	let { onsaved }: { onsaved?: () => void } = $props();

	let birthDate = $state('');
	let parentalConsent = $state(false);
	let busy = $state(false);
	let error = $state('');

	// 18歳未満のときだけ保護者同意を訊く。日付が未入力のうちは出さない。
	let needsConsent = $derived(birthDate !== '' && !isAdultBirthDate(birthDate));
	let today = new Date().toISOString().slice(0, 10);

	const errorText = (reason: Exclude<DeclareResult, { ok: true }>['reason']) =>
		reason === 'already_set'
			? m.ageErrorAlreadySet()
			: reason === 'consent_required'
				? m.ageErrorConsentRequired()
				: reason === 'invalid'
					? m.ageErrorInvalid()
					: m.ageErrorFailed();

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (busy || !birthDate) return;
		busy = true;
		error = '';
		const result = await declareBirthDate(birthDate, parentalConsent);
		busy = false;
		if (result.ok) onsaved?.();
		else error = errorText(result.reason);
	}
</script>

<section class="age-assurance">
	<h2>{m.ageSectionTitle()}</h2>
	{#if ageAssurance.loading}
		<p class="note">…</p>
	{:else if ageAssurance.declared}
		<p class="note">{ageAssurance.isAdult ? m.ageDeclaredAdult() : m.ageDeclaredMinor()}</p>
	{:else}
		<p class="note">{m.ageUndeclared()}</p>
		<form onsubmit={submit}>
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
			{#if error}<p class="error" role="alert">{error}</p>{/if}
			<button class="login" type="submit" disabled={busy || !birthDate}>{m.ageSubmit()}</button>
		</form>
	{/if}
</section>

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
