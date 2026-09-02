<script lang="ts">
	import { onMount } from 'svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import SignedOutNotice from '$lib/components/SignedOutNotice.svelte';
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

<section class="auth-card settings-detail">
	<a class="settings-back" href="/settings">← {m.backToSettings()}</a>
	<h1>{m.settingsHomeListTitle()}</h1>

	{#if !$session && $oauthReady}
		<SignedOutNotice message={m.homeListSignInRequired()} legend={m.settingsHomeListTitle()} />
	{:else if $session}
		<fieldset class="theme-settings">
			<legend>{m.settingsHomeListTitle()}</legend>
			<p>{m.homeListHelp()}</p>
			<p class="muted">{m.homeListPrivateNote()}</p>
			<p class="muted">
				{m.homeListCount({ count: privateList.members.length, limit: privateList.limit })}
			</p>
		</fieldset>

		{#if error}<p class="mute-error" role="alert">{error}</p>{/if}
		{#if loading && !privateList.loaded}
			<p>{m.loading()}</p>
		{:else if !privateList.members.length}
			<p class="muted">{m.homeListEmpty()}</p>
		{:else}
			<ul class="home-list">
				{#each privateList.members as member (member.did)}
					<li>
						<a href={`/profile/${member.did}`}>
							<Avatar actor={member} size="small" />
							<span>
								<strong>{member.displayName ?? member.handle}</strong>
								<span class="muted">@{member.handle}</span>
							</span>
						</a>
						<button
							type="button"
							class="ghost"
							disabled={privateList.isPending(member.did)}
							onclick={() => void remove(member)}>{m.homeListRemove()}</button
						>
					</li>
				{/each}
			</ul>
		{/if}
	{/if}
</section>

<style>
	.home-list {
		display: grid;
		gap: 0.5rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.home-list li,
	.home-list a {
		display: flex;
		align-items: center;
	}
	.home-list li {
		justify-content: space-between;
		gap: 0.75rem;
	}
	.home-list a {
		min-width: 0;
		gap: 0.65rem;
		color: inherit;
		text-decoration: none;
	}
	.home-list a > span {
		display: grid;
		min-width: 0;
	}
	.home-list a span span {
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.home-list button {
		flex: 0 0 auto;
		padding: 7px 10px;
	}
</style>
