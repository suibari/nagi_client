<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Button from '$lib/components/Button.svelte';
	import EmojiFavoritesEditor from '$lib/components/EmojiFavoritesEditor.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import { session, oauthReady } from '$lib/oauth/session.svelte';
	import SignedOutNotice from '$lib/components/SignedOutNotice.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import {
		deleteBluemoji,
		displayEmojiName,
		listMyBluemoji,
		type MyEmoji,
	} from '$lib/atproto/bluemoji';
	import BluemojiMedia from '$lib/components/BluemojiMedia.svelte';
	import InfiniteScroll from '$lib/components/InfiniteScroll.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import EmojiGeneratePanel from '$lib/components/EmojiGeneratePanel.svelte';

	type EmojiTab = 'create' | 'generate' | 'mine';

	const EMOJIAT_URL = 'https://emojiat.suibari.com/';

	// 既定は左端の「絵文字をつくる」。通知などからはクエリでほかのタブを直接開ける。
	// 廃止した「画像から作成」「まとめて作成」（single / batch）は、代わりになる「絵文字をつくる」へ寄せる。
	const initialTab = page.url.searchParams.get('tab');
	let activeTab = $state<EmojiTab>(
		initialTab === 'generate' || initialTab === 'mine' ? initialTab : 'create',
	);
	let emojis = $state<MyEmoji[]>([]);
	let loaded = $state(false);
	let busy = $state(false);
	let status = $state('');
	let error = $state('');
	let visibleEmojiCount = $state(60);

	const safeInternalReturnTo = (value: string | null) => {
		if (!value?.startsWith('/') || value.startsWith('//')) return undefined;
		try {
			const base = new URL('https://nagi.local');
			const resolved = new URL(value, base);
			if (resolved.origin !== base.origin) return undefined;
			return `${resolved.pathname}${resolved.search}${resolved.hash}`;
		} catch {
			return undefined;
		}
	};
	const returnTo = $derived(safeInternalReturnTo(page.url.searchParams.get('returnTo')));
	const tabs: { id: EmojiTab; label: () => string }[] = [
		{ id: 'create', label: () => m.emojiCreateTitle() },
		{ id: 'generate', label: () => m.emojiGenerateTitle() },
		{ id: 'mine', label: () => m.emojiMineTitle() },
	];

	function selectTab(tab: EmojiTab) {
		if (tab === activeTab) return;
		activeTab = tab;
		// 権限の更新などでページを離れても、戻ったときに同じタブを開けるよう URL に残す。
		const url = new URL(page.url);
		if (tab === 'create') url.searchParams.delete('tab');
		else url.searchParams.set('tab', tab);
		replaceState(url, page.state);
		// えもじあっとで保存して戻ってきたときに、新しい絵文字が並ぶようにする。
		if (tab === 'mine' && loaded) void loadEmojis().catch(() => undefined);
	}

	function handleTabKeydown(event: KeyboardEvent, tab: EmojiTab) {
		const index = tabs.findIndex((item) => item.id === tab);
		const next =
			event.key === 'ArrowRight'
				? (index + 1) % tabs.length
				: event.key === 'ArrowLeft'
					? (index + tabs.length - 1) % tabs.length
					: event.key === 'Home'
						? 0
						: event.key === 'End'
							? tabs.length - 1
							: -1;
		if (next < 0) return;
		event.preventDefault();
		selectTab(tabs[next].id);
		(document.getElementById(`emoji-tab-${activeTab}`) as HTMLButtonElement)?.focus();
	}
	const visibleEmojis = $derived(emojis.slice(0, visibleEmojiCount));

	const loadEmojis = async () => {
		emojis = await listMyBluemoji();
		visibleEmojiCount = Math.max(60, Math.min(visibleEmojiCount, emojis.length));
	};

	$effect(() => {
		if (!$session?.did || loaded) return;
		loadEmojis()
			.catch((cause) => (error = cause instanceof Error ? cause.message : m.emojiLoadFailed()))
			.finally(() => (loaded = true));
	});

	async function remove(emoji: MyEmoji) {
		if (busy || !confirm(m.emojiDeleteConfirm({ emoji: displayEmojiName(emoji.name) }))) return;
		busy = true;
		status = '';
		error = '';
		try {
			await deleteBluemoji(emoji.rkey);
			emojis = emojis.filter((item) => item.uri !== emoji.uri);
			status = m.emojiDeleted();
		} catch (cause) {
			error = cause instanceof Error ? cause.message : m.emojiDeleteFailed();
		} finally {
			busy = false;
		}
	}
</script>

<PageHeader title={m.emojiSettingsTitle()} description={m.emojiSettingsNote()} />
<div class="emoji-page">
	{#if returnTo}<a class="settings-back" href={returnTo}>← {m.emojiBackToSource()}</a>{/if}
	<EmojiFavoritesEditor />
	<section class="emoji-custom-section" aria-label={m.emojiSettingsTitle()}>
		{#if !$session && $oauthReady}
			<SignedOutNotice message={m.loginRequired()} />
		{:else if $session}
			<div class="emoji-settings-tabs" role="tablist" aria-label={m.emojiSettingsTitle()}>
				{#each tabs as tab (tab.id)}
					<button
						type="button"
						id={`emoji-tab-${tab.id}`}
						role="tab"
						aria-selected={activeTab === tab.id}
						aria-controls={`emoji-panel-${tab.id}`}
						tabindex={activeTab === tab.id ? 0 : -1}
						class:active={activeTab === tab.id}
						onkeydown={(event) => handleTabKeydown(event, tab.id)}
						onclick={() => selectTab(tab.id)}>{tab.label()}</button
					>
				{/each}
			</div>
			{#if status}<p role="status">
					{status}
					{#if returnTo}
						<a class="emoji-return" href={returnTo}>{m.emojiBackToSource()}</a>
					{/if}
				</p>{/if}
			{#if error}<p class="error" role="alert">{error}</p>{/if}
			{#if activeTab === 'create'}
				<div id="emoji-panel-create" role="tabpanel" aria-labelledby="emoji-tab-create">
					<div class="emojiat-card">
						<div class="emojiat-text">
							<h2>{m.emojiatTitle()}</h2>
							<p>{m.emojiatNote()}</p>
						</div>
						<ul class="emojiat-ways">
							<li><Icon name="text" size={16} />{m.emojiatFromText()}</li>
							<li><Icon name="image" size={16} />{m.emojiatFromImage()}</li>
							<li><Icon name="edit" size={16} />{m.emojiatFromDrawing()}</li>
						</ul>
						<Button
							variant="primary"
							href={EMOJIAT_URL}
							target="_blank"
							rel="noopener"
							class="emojiat-open"
						>
							<span>{m.emojiatOpen()}</span>
							<Icon name="external" size={16} />
						</Button>
					</div>
					<p class="emojiat-after">{m.emojiatAfter()}</p>
				</div>
			{:else if activeTab === 'generate'}
				<div id="emoji-panel-generate" role="tabpanel" aria-labelledby="emoji-tab-generate">
					<EmojiGeneratePanel onregistered={loadEmojis} />
				</div>
			{:else}
				<div id="emoji-panel-mine" role="tabpanel" aria-labelledby="emoji-tab-mine">
					{#if !loaded}
						<Spinner />
					{:else if !emojis.length}
						<p>{m.emojiMineEmpty()}</p>
					{:else}
						<div class="emoji-settings-grid">
							{#each visibleEmojis as emoji (emoji.uri)}
								<div class="emoji-settings-item" title={displayEmojiName(emoji.name)}>
									<BluemojiMedia {emoji} />
									<div class="emoji-settings-meta">
										<strong>{emoji.name}</strong>
										{#if emoji.alt}<small>{emoji.alt}</small>{/if}
									</div>
									<button
										type="button"
										class="emoji-sort-remove"
										disabled={busy}
										aria-label={m.emojiDeleteConfirm({ emoji: displayEmojiName(emoji.name) })}
										onclick={() => remove(emoji)}
									>
										<Icon name="close" size={12} />
									</button>
								</div>
							{/each}
							<InfiniteScroll
								hasMore={visibleEmojiCount < emojis.length}
								loading={false}
								onload={() => {
									visibleEmojiCount = Math.min(emojis.length, visibleEmojiCount + 60);
								}}
							/>
						</div>
					{/if}
				</div>
			{/if}
		{/if}
	</section>
</div>
