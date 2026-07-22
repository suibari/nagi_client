<script lang="ts">
	import type { NewsView } from '$lib/api/types';
	import { createPost, preparePostDraft, uploadPostAssets } from '$lib/atproto/records';
	import { crosspostToBluesky } from '$lib/crosspost/bluesky';
	import { getCrosspostEnabled, hasCrosspostScope } from '$lib/crosspost/preferences';
	import { session } from '$lib/oauth/session.svelte';
	import { m, dateLocale } from '$lib/i18n/i18n.svelte';
	import Icon from './shell/Icon.svelte';
	let { news }: { news: NewsView } = $props();
	let composing = $state(false), text = $state(''), busy = $state(false), error = $state(''), shared = $state(false);
	let safeUrl = $derived.by(() => { try { const u = new URL(news.url); return ['http:', 'https:'].includes(u.protocol) ? u.href : undefined; } catch { return undefined; } });
	async function share() {
		if (!safeUrl) return;
		try {
			if (navigator.share) await navigator.share({ title: news.title, url: safeUrl });
			else { await navigator.clipboard.writeText(safeUrl); shared = true; setTimeout(() => shared = false, 2000); }
		} catch (e) { if ((e as DOMException)?.name !== 'AbortError') error = m.newsShareFailed(); }
	}
	function openQuote() {
		if (!$session) { location.href = '/login'; return; }
		composing = !composing; error = '';
	}
	async function quote() {
		if (!$session || !text.trim() || busy) return;
		busy = true; error = '';
		const draft = preparePostDraft(text, undefined, { uri: news.uri, cid: news.cid }, [], [{ uri: news.url, title: news.title }]);
		try {
			const assets = await uploadPostAssets(draft);
			await createPost(draft, assets);
			if (getCrosspostEnabled() && await hasCrosspostScope()) await crosspostToBluesky(draft, assets).catch((e) => { error = m.crosspostWarning({ reason: e instanceof Error ? e.message : m.crosspostFailed() }); });
			text = ''; composing = false;
		} catch (e) { error = e instanceof Error ? e.message : m.postFailed(); }
		finally { busy = false; }
	}
</script>

<article class="news-card">
	<div class="news-meta"><span>{news.sourceName ?? m.newsSourceUnknown()}</span>{#if news.publishedAt}<time>{new Date(news.publishedAt).toLocaleString(dateLocale(), { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</time>{/if}</div>
	<h2>{news.title}</h2>
	<div class="bot-comment"><Icon name="bot" size={25}/><p>{news.botComment}</p></div>
	<div class="news-actions">
		{#if safeUrl}<a class="ghost" href={safeUrl} target="_blank" rel="noopener noreferrer">{m.newsReadArticle()}</a>{/if}
		<button class="ghost" type="button" onclick={openQuote}><Icon name="quote" size={17}/>{m.newsQuote()}</button>
		<button class="ghost" type="button" onclick={share}>{shared ? m.newsCopied() : m.newsShare()}</button>
	</div>
	{#if composing}<div class="news-composer"><label>{m.newsQuoteLabel()}<textarea bind:value={text} maxlength="3000" placeholder={m.quotePlaceholder()} disabled={busy}></textarea></label><div><button class="ghost" type="button" onclick={() => composing = false}>{m.cancel()}</button><button class="primary" type="button" disabled={busy || !text.trim()} onclick={quote}>{busy ? m.composerSubmitting() : m.composerSubmit()}</button></div></div>{/if}
	{#if error}<p class="error" role="alert">{error}</p>{/if}
</article>

<style>
	.news-card{padding:1rem 1.1rem;border-bottom:1px solid var(--line);background:var(--bg-raised)}
	.news-meta{display:flex;gap:.65rem;color:var(--text-muted);font-size:.78rem}.news-meta time{margin-left:auto}
	h2{font-size:1.08rem;line-height:1.55;margin:.45rem 0 .75rem}
	.bot-comment{display:flex;align-items:flex-start;gap:.6rem}.bot-comment p{margin:0;padding:.65rem .8rem;border-radius:0 1rem 1rem 1rem;background:var(--accent-soft);line-height:1.5}
	.news-actions{display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.85rem}.news-actions a,.news-actions button{display:inline-flex;align-items:center;gap:.3rem;text-decoration:none}
	.news-composer{margin-top:.75rem}.news-composer label{display:grid;gap:.35rem;font-size:.85rem}.news-composer textarea{min-height:6rem;resize:vertical;padding:.7rem;border:1px solid var(--line);border-radius:.7rem;background:var(--bg-raised);color:var(--text)}.news-composer>div{display:flex;justify-content:flex-end;gap:.4rem;margin-top:.45rem}.error{color:var(--danger)}
</style>
