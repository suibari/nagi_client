<script lang="ts">
	import { m } from '$lib/i18n/i18n.svelte';
	import { loadProfileAppLinks, type AppLinkView } from '$lib/atproto/appLinks';

	let { did }: { did?: string } = $props();

	let links = $state<AppLinkView[]>([]);
	// did ごとに一度だけ読む。表示はプロフィール所有者の PDS を直読みするため失敗しても静かに握りつぶす。
	let loadedDid = '';
	$effect(() => {
		const target = did;
		if (!target || target === loadedDid) return;
		loadedDid = target;
		links = [];
		loadProfileAppLinks(target)
			.then((result) => {
				if (loadedDid === target) links = result;
			})
			.catch(() => {
				if (loadedDid === target) links = [];
			});
	});

	function titleField(link: AppLinkView) {
		return link.fields.find((f) => f.role === 'title');
	}
	function otherFields(link: AppLinkView) {
		return link.fields.filter((f) => f.role !== 'title');
	}
</script>

{#if links.length}
	<section class="app-links" aria-label={m.profileAppLinksHeading()}>
		{#each links as link (link.label)}
			<article class="app-link">
				<header>
					{#if link.iconUrl}
						<img class="icon" src={link.iconUrl} alt="" width="18" height="18" loading="lazy" />
					{/if}
					{#if link.appUri}
						<a class="name" href={link.appUri} target="_blank" rel="noopener noreferrer">{link.label}</a>
					{:else}
						<span class="name">{link.label}</span>
					{/if}
					{#if titleField(link)}<span class="title">{titleField(link)?.value}</span>{/if}
				</header>
				{#if otherFields(link).length}
					<dl class="fields">
						{#each otherFields(link) as f, i (i)}
							<div class="row">
								{#if f.label}<dt>{f.label}</dt>{/if}
								<dd>
									{#if f.role === 'url'}
										<a href={f.value} target="_blank" rel="noopener noreferrer">{f.value}</a>
									{:else}{f.value}{/if}
								</dd>
							</div>
						{/each}
					</dl>
				{/if}
			</article>
		{/each}
	</section>
{/if}

<style>
	.app-links {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-block-start: 0.75rem;
	}
	.app-link {
		border: 1px solid var(--line);
		border-radius: var(--radius-m);
		padding: 0.5rem 0.65rem;
		background: var(--bg-inset, transparent);
	}
	.app-link header {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		flex-wrap: wrap;
	}
	.app-link .icon {
		border-radius: var(--radius-s);
		flex: none;
	}
	.app-link .name {
		font-weight: 600;
		font-size: 0.85rem;
		color: var(--text);
		text-decoration: none;
	}
	.app-link a.name:hover {
		text-decoration: underline;
	}
	.app-link .title {
		font-size: 0.9rem;
		color: var(--text);
	}
	.fields {
		margin: 0.35rem 0 0;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}
	.fields .row {
		display: flex;
		gap: 0.4rem;
		font-size: 0.82rem;
	}
	.fields dt {
		color: var(--text-muted);
		flex: none;
	}
	.fields dd {
		margin: 0;
		color: var(--text);
		min-inline-size: 0;
		word-break: break-word;
	}
</style>
