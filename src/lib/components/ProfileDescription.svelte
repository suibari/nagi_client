<script lang="ts">
	import { RichText } from '@atproto/api';
	import { httpUrl } from '$lib/atproto/facets';
	import { decorateSiblingUrl } from '$lib/sso/links';

	type Segment = { text: string; href?: string; external?: boolean };

	let { text }: { text: string } = $props();

	const detectLinks = (source: string): Segment[] => {
		const richText = new RichText({ text: source });
		// Bluesky と同じ検出規則を使う。mention の DID 解決はせず、handle のまま
		// Nagi 内プロフィールへ渡して AppView 側で解決する。
		richText.detectFacetsWithoutResolution();
		return [...richText.segments()].map((segment) => {
			const link = segment.link?.uri
				? decorateSiblingUrl(httpUrl(segment.link.uri))
				: undefined;
			if (link) return { text: segment.text, href: link, external: true };
			const handle = segment.mention?.did.trim().toLowerCase();
			if (handle) return { text: segment.text, href: `/profile/${encodeURIComponent(handle)}` };
			return { text: segment.text };
		});
	};

	let segments = $derived(detectLinks(text));
</script>

<p class="description">
	{#each segments as segment}{#if segment.href}<a
				class="rich-link"
				href={segment.href}
				target={segment.external ? '_blank' : undefined}
				rel={segment.external ? 'noopener noreferrer' : undefined}>{segment.text}</a
			>{:else}{segment.text}{/if}{/each}
</p>
