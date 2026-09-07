<script lang="ts">
	import type { BusinessCardData } from '$lib/card/data';
	import { dateLocale, m } from '$lib/i18n/i18n.svelte';
	import Avatar from './Avatar.svelte';
	import ProfileTagList from './ProfileTagList.svelte';

	/**
	 * 名刺カードの DOM 表現。
	 *
	 * ⚠ 見た目は $lib/card/render.ts（Canvas 版・共有画像用）と対になっている。
	 *    レイアウトを変えるときは必ず両方直し、/dev/name-card で並べて確認すること。
	 *    意図的な差は3つだけ:
	 *      - こちらはテーマ追従、あちらはライト固定
	 *      - QR はこちらには出さない。画面上ではカードを押せばプロフィールへ行けるので、
	 *        QR は「画像として配られた先」でしか意味を持たない。
	 *      - suibari.com のブランドロゴは共有用の PNG にだけ出す。
	 */
	let {
		data,
		size = 'full',
		onclick,
		tags = data.tags,
		clickableTags = false,
	}: {
		data: BusinessCardData;
		/** compact はプロフィールヘッダーとホバーカード用。full は拡大モーダル用。 */
		size?: 'compact' | 'full';
		/** 渡すとカード全体がボタンになる（タップで拡大）。 */
		onclick?: () => void;
		/** ホバー表示だけが6タグへ差し替える。通常の名刺とPNGは data.tags の3件を保つ。 */
		tags?: readonly string[];
		clickableTags?: boolean;
	} = $props();

	const joined = $derived(
		data.joinedAt
			? m.nameCardJoinedAt({
					date: new Date(data.joinedAt).toLocaleDateString(dateLocale(), {
						year: 'numeric',
						month: 'long',
						day: 'numeric',
					}),
				})
			: undefined,
	);
	const updated = $derived(
		data.updatedAt
			? m.nameCardUpdatedAt({
					date: new Date(data.updatedAt).toLocaleDateString(dateLocale(), {
						year: 'numeric',
						month: 'long',
						day: 'numeric',
					}),
				})
			: undefined,
	);
</script>

{#snippet body()}
	<!-- アバターを主役にし、その横に名前・ハンドル・タグを縦に積む。
	     3行ぶんの高さがアバターと釣り合うので、頭とタグの間に余白が空かない。 -->
	<div class="bc-head">
		<Avatar actor={data} />
		<div class="bc-names">
			<strong>{data.displayName || data.handle}</strong>
			<span class="bc-handle">@{data.handle}</span>
			{#if tags.length}
				<ProfileTagList {tags} clickable={clickableTags} className="bc-tags" />
			{/if}
		</div>
	</div>

	<!-- botたんのセリフだが、ユーザーの名刺なので botたんのアバターは出さず文字だけで表す。 -->
	<p class="bc-tagline">{data.tagline}</p>

	{#if joined || updated}
		<div class="bc-dates">
			{#if joined}<span>{joined}</span>{/if}
			{#if updated}<span>{updated}</span>{/if}
		</div>
	{/if}
{/snippet}

<!-- onclick の有無で要素そのものを変える。svelte:element だと Svelte が button だと
     静的に判定できず、a11y の警告を消すために role を手で足すことになる。 -->
{#if onclick}
	<button
		type="button"
		class="business-card interactive"
		class:compact={size === 'compact'}
		aria-label={m.nameCardOpenAria()}
		{onclick}
	>
		{@render body()}
	</button>
{:else}
	<div class="business-card" class:compact={size === 'compact'}>
		{@render body()}
	</div>
{/if}
