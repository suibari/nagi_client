<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';
	import Icon from '$lib/components/shell/Icon.svelte';
	import type { AppLinkView } from '$lib/atproto/appLinks';

	let {
		link,
		editable = false,
		editing = false,
		onedit,
	}: {
		link: AppLinkView;
		editable?: boolean;
		editing?: boolean;
		onedit?: () => void;
	} = $props();

	// 単一表示（従来レイアウト）は 1 レコードのときだけ。複数はコンパクトなリスト行で並べる。
	let single = $derived(link.records.length === 1 ? link.records[0] : null);
</script>

{#snippet fieldList(fields: AppLinkView['records'][number]['fields'])}
	<ul class="fields">
		{#each fields as f, i (i)}
			<li class="field {f.role}">
				{#if f.role === 'datetime'}<Icon name="clock" size={13} />{:else if f.role === 'url'}<Icon name="link" size={13} />{/if}
				{#if f.role === 'url'}
					<a href={f.value} target="_blank" rel="noopener noreferrer">{f.value}</a>
				{:else}
					<span>{f.value}</span>
				{/if}
			</li>
		{/each}
	</ul>
{/snippet}

<article class="app-link" class:editing class:has-thumb={single && single.images.length}>
	{#if single && single.images.length}
		<div class="thumb">
			<img class="cover" src={single.images[0]} alt="" loading="lazy" />
			{#if single.images.length > 1}<span class="more">+{single.images.length - 1}</span>{/if}
		</div>
	{/if}

	<div class="body">
		<header>
			{#if link.iconUrl}
				<img class="icon" src={link.iconUrl} alt="" width="18" height="18" loading="lazy" />
			{:else}
				<span class="icon fallback"><Icon name="apps" size={14} /></span>
			{/if}
			{#if link.appUri}
				<a class="name" href={link.appUri} target="_blank" rel="noopener noreferrer">{link.label}</a>
			{:else}
				<span class="name">{link.label}</span>
			{/if}
			{#if editable}
				<button type="button" class="edit" aria-label={m.appLinksEdit()} title={m.appLinksEdit()} aria-pressed={editing} onclick={() => onedit?.()}>
					<Icon name="edit" size={16} />
				</button>
			{/if}
		</header>

		{#if single}
			{#if single.fields.length}
				{@render fieldList(single.fields)}
			{/if}
		{:else}
			<ul class="rows">
				{#each link.records as rec, i (i)}
					<li class="row" class:has-thumb={rec.images.length}>
						{#if rec.images.length}
							<img class="row-thumb" src={rec.images[0]} alt="" width="36" height="36" loading="lazy" />
						{/if}
						<div class="row-body">
							{@render fieldList(rec.fields)}
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</article>

<style>
	.app-link {
		display: flex;
		gap: 0.6rem;
		align-items: flex-start;
		border: 1px solid var(--line);
		border-radius: var(--radius-m);
		padding: 0.55rem 0.65rem;
		background: var(--bg-inset, transparent);
	}
	.app-link.editing {
		border-color: var(--accent);
	}
	.thumb {
		position: relative;
		flex: none;
		inline-size: 64px;
		block-size: 64px;
	}
	.thumb .cover {
		inline-size: 64px;
		block-size: 64px;
		object-fit: cover;
		border-radius: var(--radius-s);
		display: block;
	}
	.thumb .more {
		position: absolute;
		inset-block-end: 2px;
		inset-inline-end: 2px;
		padding: 0 0.3rem;
		font-size: 0.7rem;
		font-weight: 700;
		color: #fff;
		background: rgb(0 0 0 / 0.6);
		border-radius: var(--radius-pill);
	}
	.body {
		flex: 1;
		min-inline-size: 0;
		display: flex;
		flex-direction: column;
	}
	header {
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}
	.icon {
		border-radius: var(--radius-s);
		flex: none;
	}
	.icon.fallback {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		inline-size: 18px;
		block-size: 18px;
		color: var(--text-muted);
	}
	.name {
		font-weight: 600;
		font-size: 0.85rem;
		color: var(--text);
		text-decoration: none;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	a.name:hover {
		text-decoration: underline;
	}
	.edit {
		margin-inline-start: auto;
		flex: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: 0;
		color: var(--text-muted);
		cursor: pointer;
		padding: 0.2rem;
		border-radius: var(--radius-s);
	}
	.edit:hover,
	.edit[aria-pressed='true'] {
		color: var(--accent);
		background: var(--bg-inset);
	}
	.fields {
		list-style: none;
		margin: 0.3rem 0 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}
	.field {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.82rem;
		color: var(--text);
		min-inline-size: 0;
	}
	.field :global(svg) {
		color: var(--text-muted);
		flex: none;
	}
	.field span,
	.field a {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		/* ネスト flex 内で長文が縮まずカードを押し広げるのを防ぐ（省略記号を効かせる）。 */
		min-inline-size: 0;
	}
	.field.datetime {
		color: var(--text-muted);
	}
	/* repeat 展開時のリスト行。1要素=小サムネ+フィールドの詰まった1行。 */
	.rows {
		list-style: none;
		margin: 0.35rem 0 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		min-inline-size: 0;
	}
	.row-thumb {
		flex: none;
		inline-size: 36px;
		block-size: 36px;
		object-fit: cover;
		border-radius: var(--radius-s);
		display: block;
	}
	.row-body {
		flex: 1;
		min-inline-size: 0;
	}
	.row-body .fields {
		margin: 0;
		gap: 0.1rem;
	}
</style>
