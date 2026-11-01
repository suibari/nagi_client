<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { onMount } from 'svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import SignedOutNotice from '$lib/components/SignedOutNotice.svelte';
	import SettingRow from '$lib/components/SettingRow.svelte';
	import SettingsPage from '$lib/components/SettingsPage.svelte';
	import SettingsSection from '$lib/components/SettingsSection.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { oauthReady, session } from '$lib/oauth/session.svelte';
	import { privateList } from '$lib/private-list/private-list.svelte';
	import type { ActorView } from '$lib/api/types';

	let loading = $state(false);
	let error = $state('');
	let attempted = $state(false);

	onMount(() => {
		if ($session && !privateList.loaded) void reload();
	});
	$effect(() => {
		if ($session && $oauthReady && !privateList.loaded && !loading && !attempted) void reload();
	});

	async function reload() {
		attempted = true;
		loading = true;
		error = '';
		await privateList.load();
		if (!privateList.loaded) error = m.loadFailed();
		loading = false;
	}

	async function remove(member: ActorView) {
		error = '';
		try {
			await privateList.toggle(member, false);
		} catch {
			error = m.homeListUpdateFailed();
		}
	}
</script>

<SettingsPage title={m.settingsHomeListTitle()} description={m.homeListHelp()}>
	{#if !$session && $oauthReady}
		<SignedOutNotice message={m.homeListSignInRequired()} />
	{:else if $session}
		{#if error}<p class="settings-error" role="alert">{error}</p>{/if}
		<SettingsSection
			title={m.homeListCount({ count: privateList.members.length, limit: privateList.limit })}
			description={m.homeListPrivateNote()}
		>
			{#if loading && !privateList.loaded}
				<SettingRow><Spinner /></SettingRow>
			{:else if !privateList.members.length}
				<SettingRow description={m.homeListEmpty()} />
			{:else}
				{#each privateList.members as member (member.did)}
					<div class="setting-row has-control">
						<a class="member" href={`/profile/${member.did}`}>
							<Avatar actor={member} size="small" />
							<span>
								<strong>{member.displayName ?? member.handle}</strong>
								<span class="muted">@{member.handle}</span>
							</span>
						</a>
						<Button
							variant="secondary"
							size="sm"
							type="button"
							disabled={privateList.isPending(member.did)}
							onclick={() => void remove(member)}>{m.homeListRemove()}</Button
						>
					</div>
				{/each}
			{/if}
		</SettingsSection>
	{/if}
</SettingsPage>

<style>
	.member {
		display: flex;
		align-items: center;
		gap: 12px;
		min-width: 0;
		color: inherit;
		text-decoration: none;
	}
	.member > span {
		display: grid;
		min-width: 0;
	}
	.member strong {
		font-weight: 500;
	}
	.member span span {
		overflow: hidden;
		text-overflow: ellipsis;
		font-size: 0.8rem;
	}
</style>
