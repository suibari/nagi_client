<script lang="ts">
	import { page } from '$app/state';
	import BlogWriter from '$lib/components/BlogWriter.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { loadBlogEditTarget, type BlogEditTarget } from '$lib/blog/edit-target';
	import { m } from '$lib/i18n/i18n.svelte';
	import { oauthReady, session } from '$lib/oauth/session.svelte';

	let target = $state<BlogEditTarget>();
	let status = $state<'loading' | 'ready' | 'missing' | 'error'>('loading');
	let loadedKey = '';

	// 編集できるのは本人の記事だけなので、DID は URL ではなくセッションから決める（BLOG-07）。
	$effect(() => {
		if (!$oauthReady) return;
		const did = $session?.did;
		if (!did) {
			location.href = '/login';
			return;
		}
		const rkey = page.params.rkey ?? '';
		const key = `${did}/${rkey}`;
		if (key === loadedKey) return;
		loadedKey = key;
		status = 'loading';
		target = undefined;
		loadBlogEditTarget(did, rkey)
			.then((result) => {
				if (loadedKey !== key) return;
				target = result;
				status = result ? 'ready' : 'missing';
			})
			.catch(() => {
				if (loadedKey === key) status = 'error';
			});
	});
</script>

{#if status === 'ready' && target}
	{#key target.uri}<BlogWriter editTarget={target} />{/key}
{:else if status === 'loading'}
	<Spinner />
{:else}
	<PageHeader title={m.blogEdit()} back={{ href: '/blog', label: m.blogBackToList() }} />
	<p class="state error" role="alert">
		{status === 'missing' ? m.blogEditNotFound() : m.loadFailed()}
	</p>
{/if}
