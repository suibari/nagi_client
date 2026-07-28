<script lang="ts">
	import { onMount } from 'svelte';
	import type { ActorView, PostView } from '$lib/api/types';
	import type { BusinessCardData } from '$lib/card/data';
	import { renderBusinessCard } from '$lib/card/render';
	import { i18n, m } from '$lib/i18n/i18n.svelte';
	import BusinessCard from './BusinessCard.svelte';
	import ChatBubble from './ChatBubble.svelte';
	import Icon from './shell/Icon.svelte';

	/**
	 * 名刺の拡大表示と共有。
	 * ダイアログは既存の手書き規約に合わせる（CardDetailDialog.svelte が手本）:
	 * backdrop + role="dialog" aria-modal、Escape、背景クリック、開いたら閉じるへ focus。
	 */
	let {
		data,
		comment,
		botActor,
		onclose,
	}: {
		data: BusinessCardData;
		/**
		 * botたんの長文分析。名刺には短い tagline しか載らないので、全文はここで読ませる。
		 * 名刺そのものは画像に焼かれるが、この長文は画像には入らない。
		 */
		comment?: string;
		/** 吹き出しに出す botたん本人。無ければ表示名だけのフォールバックを使う。 */
		botActor?: ActorView;
		onclose: () => void;
	} = $props();

	// 元のプロフィール表示と同じく、合成 PostView にして botたんの吹き出しで見せる
	// （NewsCard.svelte と同じ手）。名刺は本人のものなので、botたんのアバターが出るのは
	// この分析欄だけ。
	const commentBotPost = $derived<PostView | undefined>(
		comment
			? {
					uri: `at://${data.did}/#bot-comment`,
					cid: 'bot-comment',
					author: botActor ?? {
						did: 'did:unknown:bot-tan',
						handle: 'bot-tan',
						displayName: 'Botたん',
						isBot: true,
					},
					text: comment,
					langs: [i18n.locale],
					createdAt: data.updatedAt ?? new Date().toISOString(),
					indexedAt: data.updatedAt ?? new Date().toISOString(),
					reactions: [],
					isBot: true,
					isAffirmation: false,
				}
			: undefined,
	);

	let closeButton = $state<HTMLButtonElement>();
	let busy = $state(false);
	let copied = $state(false);
	let error = $state<string>();
	/** 生成した PNG。保存と共有で使い回す（毎回描き直さない）。 */
	let image = $state<Blob>();
	let previewUrl = $state<string>();

	const cardName = $derived(data.displayName || data.handle);

	onMount(() => {
		closeButton?.focus();
		return () => {
			if (previewUrl) URL.revokeObjectURL(previewUrl);
		};
	});

	async function ensureImage(): Promise<Blob | undefined> {
		if (image) return image;
		busy = true;
		error = undefined;
		try {
			const blob = await renderBusinessCard(data);
			image = blob;
			previewUrl = URL.createObjectURL(blob);
			return blob;
		} catch {
			error = m.nameCardRenderFailed();
			return undefined;
		} finally {
			busy = false;
		}
	}

	async function save() {
		const blob = await ensureImage();
		if (!blob) return;
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `nagi-card-${data.handle}.png`;
		link.click();
		URL.revokeObjectURL(url);
	}

	async function share() {
		const blob = await ensureImage();
		if (!blob) return;
		const file = new File([blob], `nagi-card-${data.handle}.png`, { type: 'image/png' });
		try {
			// 画像ごと共有できる端末では画像を渡す。できなければ URL のコピーに落とす。
			if (navigator.canShare?.({ files: [file] })) {
				await navigator.share({ files: [file], text: data.profileUrl });
				return;
			}
			await navigator.clipboard.writeText(data.profileUrl);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch (e) {
			// 共有シートを閉じただけの AbortError は失敗ではない（NewsCard.svelte と同じ扱い）。
			if ((e as DOMException)?.name !== 'AbortError') error = m.nameCardShareFailed();
		}
	}

	function backdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) onclose();
	}
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && onclose()} />

<div class="card-backdrop" onclick={backdropClick} role="presentation">
	<div class="card-dialog" role="dialog" aria-modal="true" aria-label={m.nameCardTitle()}>
		<div class="card-dialog-head">
			<h2>{m.nameCardTitle()}</h2>
			<button
				bind:this={closeButton}
				type="button"
				class="ghost icon-action"
				aria-label={m.nameCardClose()}
				onclick={onclose}
			>
				<Icon name="close" size={18} />
			</button>
		</div>

		<BusinessCard {data} size="full" />

		{#if previewUrl}
			<!-- 保存・共有されるのはこの PNG。DOM 版との差はここで見比べられる。 -->
			<img class="card-preview" src={previewUrl} alt={m.nameCardImageAlt({ name: cardName })} />
		{/if}

		<div class="card-actions">
			<button type="button" class="primary" disabled={busy} onclick={() => void save()}>
				<Icon name="download" size={18} />
				{m.nameCardSaveImage()}
			</button>
			<button type="button" class="ghost" disabled={busy} onclick={() => void share()}>
				<Icon name="share" size={18} />
				{copied ? m.nameCardCopied() : m.nameCardShare()}
			</button>
		</div>

		{#if error}<p class="state error" role="alert">{error}</p>{/if}

		{#if commentBotPost}
			<!-- 名刺に載るのは短い tagline だけ。分析の全文はここで読ませる。 -->
			<div class="card-comment">
				<ChatBubble post={commentBotPost} displayOnly />
			</div>
		{/if}
	</div>
</div>
