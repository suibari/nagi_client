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
</script>

<article class="app-link" class:editing class:has-thumb={link.images.length}>
	{#if link.images.length}
		<div class="thumb">
			<img class="cover" src={link.images[0]} alt="" loading="lazy" />
			{#if link.images.length > 1}<span class="more">+{link.images.length - 1}</span>{/if}
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

		{#if link.fields.length}
			<ul class="fields">
				{#each link.fields as f, i (i)}
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
	}
	.field.datetime {
		color: var(--text-muted);
	}
</style>
