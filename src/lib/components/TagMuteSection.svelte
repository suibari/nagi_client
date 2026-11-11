<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import SettingRow from '$lib/components/SettingRow.svelte';
	import SettingsSection from '$lib/components/SettingsSection.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { mutes } from '$lib/mute/mutes.svelte';
	import { hashtagHref, normalizeTag } from '$lib/tags';

	/**
	 * ミュートしたハッシュタグの追加と一覧。ミュート設定とタグ設定の両方に置く。
	 * 読み込み（mutes.load）は置く側のページが面倒を見る。
	 */
	let {
		loading = false,
		onerror,
	}: {
		loading?: boolean;
		/** 失敗の文言。空文字で消す。 */
		onerror: (message: string) => void;
	} = $props();

	async function setTagMute(tag: string, muted: boolean) {
		onerror('');
		try {
			await mutes.toggleTag(tag, muted);
			return true;
		} catch {
			onerror(m.muteUpdateFailed());
			return false;
		}
	}

	let tagInput = $state('');
	const newTag = $derived(normalizeTag(tagInput));
	async function addTagMute(event: SubmitEvent) {
		event.preventDefault();
		if (!newTag || mutes.hasTag(newTag)) {
			tagInput = '';
			return;
		}
		if (await setTagMute(newTag, true)) tagInput = '';
	}
</script>

<SettingsSection title={m.muteTagsLegend()}>
	<SettingRow>
		<form class="tag-setting-form" onsubmit={addTagMute}>
			<input
				class="settings-input"
				bind:value={tagInput}
				maxlength="128"
				placeholder={m.muteTagPlaceholder()}
				aria-label={m.muteTagAdd()}
			/>
			<Button variant="primary" type="submit" disabled={!newTag || mutes.isPending(newTag)}>
				{m.muteTagAdd()}
			</Button>
		</form>
	</SettingRow>
	{#if loading && !mutes.loaded}
		<SettingRow><Spinner /></SettingRow>
	{:else if !mutes.tags.length}
		<SettingRow description={m.muteTagsEmpty()} />
	{:else}
		{#each mutes.tags as tag (tag)}
			<div class="setting-row has-control">
				<a class="tag-setting-subject" href={hashtagHref(tag)}>#{tag}</a>
				<Button
					variant="secondary"
					size="sm"
					type="button"
					disabled={mutes.isPending(tag)}
					onclick={() => void setTagMute(tag, false)}
				>
					{m.unmuteTag()}
				</Button>
			</div>
		{/each}
	{/if}
</SettingsSection>

<style>
	.tag-setting-form {
		display: flex;
		gap: 8px;
		min-width: 0;
	}
	.tag-setting-form input {
		flex: 1;
		min-width: 0;
	}
	.tag-setting-subject {
		min-width: 0;
		overflow: hidden;
		color: inherit;
		font-weight: 500;
		text-decoration: none;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
