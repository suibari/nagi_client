<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { parsePostText } from '$lib/atproto/facets';
	import { blogEditTargetFromPost } from '$lib/blog/edit-target';
	import BlogWriter from '$lib/components/BlogWriter.svelte';
	import { session, type OAuthSession } from '$lib/oauth/session.svelte';

	const did = 'did:plc:playwright-blog-writer';
	const parsed = parsePostText('# 変更前のタイトル\n\n変更前のブログ本文 #本文タグ');
	const editTarget = page.url.searchParams.has('edit')
		? blogEditTargetFromPost(
				{
					uri: `at://${did}/site.standard.document/playwright`,
					cid: 'bafy-original',
					author: { did, handle: 'playwright.nagi.example', displayName: 'Playwright確認用' },
					text: parsed.text,
					facets: parsed.facets,
					createdAt: '2026-09-13T00:00:00.000Z',
					indexedAt: '2026-09-13T00:00:00.000Z',
					article: true,
					reactions: [],
					isBot: false,
					isAffirmation: false,
				},
				['本文タグ', '既存タグ'],
			)
		: undefined;
	let ready = $state(false);

	onMount(() => {
		const mockSession = {
			did,
			fetchHandler: (url: string | URL, init?: RequestInit) => fetch(url, init),
			getTokenInfo: async () => ({
				scope: 'atproto repo:site.standard.publication repo:site.standard.document',
			}),
		} as unknown as OAuthSession;
		session.set(mockSession);
		ready = true;
		return () => session.set(null);
	});
</script>

<section class="e2e-fixture" data-testid="blog-write-fixture">
	{#if ready}<BlogWriter {editTarget} />{/if}
	<a href="/dev/e2e/post-assist">別のページへ</a>
</section>

<style>
	.e2e-fixture {
		padding-block: 24px;
	}
</style>
