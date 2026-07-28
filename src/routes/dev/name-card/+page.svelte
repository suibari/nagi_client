<script lang="ts">
	import { dev } from '$app/environment';
	import { getProfile } from '$lib/api/appview';
	import { cardFromProfile, type BusinessCardData } from '$lib/card/data';
	import { cardFixtures } from '$lib/card/fixtures';
	import { renderBusinessCard } from '$lib/card/render';
	import Avatar from '$lib/components/Avatar.svelte';
	import AvatarLink from '$lib/components/AvatarLink.svelte';
	import BusinessCard from '$lib/components/BusinessCard.svelte';
	import BusinessCardDialog from '$lib/components/BusinessCardDialog.svelte';
	import { i18n } from '$lib/i18n/i18n.svelte';
	import { setThemePreference, type ThemePreference } from '$lib/theme';

	/**
	 * 名刺デザインの確認台（開発限定 / /dev/name-card）。
	 * 本番では +page.ts が 404 を投げる（/dev/cards と同じ流儀）。
	 *
	 * 分析は「初回登録」か「100投稿ごと」でしか発火しないので、実データを待っていては
	 * デザインを詰められない。ここでダミーだけで見た目を確定させてから、実データに移る。
	 */

	const fixtures = dev ? cardFixtures() : [];

	let mode = $state<'dummy' | 'live'>('dummy');
	let fixtureId = $state(fixtures[0]?.id ?? '');
	let liveDid = $state('');
	let liveCard = $state<BusinessCardData>();
	/** botたんの長文分析。モーダル下部の表示を確かめるために実データから拾う。 */
	let liveComment = $state<string>();
	let liveError = $state<string>();
	let loading = $state(false);

	let pngUrl = $state<string>();
	let pngError = $state<string>();
	let rendering = $state(false);
	let dialogOpen = $state(false);

	const dummyCard = $derived(fixtures.find((f) => f.id === fixtureId)?.data);
	const card = $derived(mode === 'dummy' ? dummyCard : liveCard);

	async function loadLive() {
		if (!liveDid.startsWith('did:')) {
			liveError = 'did: で始まる DID を入れてください';
			return;
		}
		loading = true;
		liveError = undefined;
		try {
			const page = await getProfile(liveDid.trim(), { limit: 1, lang: i18n.locale });
			liveCard = cardFromProfile(page.profile, location.origin);
			liveComment = page.profile.comment;
			if (!liveCard) liveError = 'このユーザーにはまだ分析がありません';
		} catch (e) {
			liveError = e instanceof Error ? e.message : String(e);
		} finally {
			loading = false;
		}
	}

	async function renderPng() {
		if (!card) return;
		rendering = true;
		pngError = undefined;
		try {
			const blob = await renderBusinessCard(card);
			if (pngUrl) URL.revokeObjectURL(pngUrl);
			pngUrl = URL.createObjectURL(blob);
		} catch (e) {
			pngError = e instanceof Error ? e.message : String(e);
		} finally {
			rendering = false;
		}
	}

	function setTheme(preference: ThemePreference) {
		setThemePreference(preference);
	}
</script>

{#if dev}
	<h1 class="page-title">名刺デザイン確認台</h1>

	<section class="card dev-panel">
		<div class="dev-row">
			<strong>モード</strong>
			<button
				class:primary={mode === 'dummy'}
				class:ghost={mode !== 'dummy'}
				onclick={() => (mode = 'dummy')}
			>
				ダミー
			</button>
			<button
				class:primary={mode === 'live'}
				class:ghost={mode !== 'live'}
				onclick={() => (mode = 'live')}
			>
				実データ
			</button>
		</div>

		{#if mode === 'dummy'}
			<div class="dev-row">
				<strong>ケース</strong>
				<select bind:value={fixtureId}>
					{#each fixtures as fixture (fixture.id)}
						<option value={fixture.id}>{fixture.label}</option>
					{/each}
				</select>
			</div>
		{:else}
			<div class="dev-row">
				<strong>DID</strong>
				<input type="text" bind:value={liveDid} placeholder="did:plc:..." />
				<button class="ghost" disabled={loading} onclick={() => void loadLive()}>読み込む</button>
			</div>
			{#if liveError}<p class="state error">{liveError}</p>{/if}
		{/if}

		<div class="dev-row">
			<strong>テーマ</strong>
			<button class="ghost" onclick={() => setTheme('light')}>ライト</button>
			<button class="ghost" onclick={() => setTheme('dark')}>ダーク</button>
			<button class="ghost" onclick={() => setTheme('system')}>システム</button>
			<small>DOM 版だけ追従し、PNG は固定テーマのままなのが正しい挙動。</small>
		</div>
	</section>

	{#if card}
		<section class="card dev-panel">
			<h2>DOM 版</h2>
			<div class="dev-sizes">
				<div>
					<small>compact（プロフィール／ホバー）</small>
					<BusinessCard data={card} size="compact" />
				</div>
				<div>
					<small>full（拡大モーダル）</small>
					<BusinessCard data={card} size="full" />
				</div>
			</div>
			<div class="dev-row">
				<button class="ghost" onclick={() => (dialogOpen = true)}>拡大モーダルを開く</button>
			</div>
		</section>

		<section class="card dev-panel">
			<h2>Canvas 版（共有される PNG）</h2>
			<p class="dev-note">
				DOM 版と Canvas 版は別実装。ここで並べて見比べ、ズレていたら両方を直すこと。
			</p>
			<div class="dev-row">
				<button class="primary" disabled={rendering} onclick={() => void renderPng()}>
					{rendering ? '生成中…' : 'PNG を生成'}
				</button>
			</div>
			{#if pngError}<p class="state error">{pngError}</p>{/if}
			{#if pngUrl}<img class="card-preview" src={pngUrl} alt="生成された名刺 PNG" />{/if}
		</section>

		<section class="card dev-panel">
			<h2>プロフィールのアバター（光るリング）</h2>
			<p class="dev-note">
				名刺を持っている人だけリングが回る。押すと名刺モーダルが開く。 OS
				の「視差効果を減らす」を有効にすると静止するのが正しい挙動。
			</p>
			<div class="dev-hover-row">
				<button
					type="button"
					class="avatar-card-button"
					aria-label="名刺を大きく表示する"
					onclick={() => (dialogOpen = true)}
				>
					<Avatar actor={card} size="large" />
				</button>
				<span>← プロフィール上部と同じ見た目</span>
			</div>
		</section>

		<section class="card dev-panel">
			<h2>ホバーカード</h2>
			<p class="dev-note">
				下のアバターにマウスを乗せる（タッチ端末では出ないのが正しい）。 ダミーの DID
				は実在しないので、ここでは取得を挟まず直接表示している。
			</p>
			<div class="dev-hover-row">
				<AvatarLink actor={card} />
				<span>← ホバー（実データ経路: getProfile を1回だけ叩く）</span>
			</div>
			<div class="dev-hover-static">
				<small>位置決めを外した素の見た目:</small>
				<BusinessCard data={card} size="compact" />
			</div>
		</section>
	{:else}
		<p class="state">表示する名刺がありません。</p>
	{/if}

	{#if dialogOpen && card}
		<BusinessCardDialog data={card} comment={liveComment} onclose={() => (dialogOpen = false)} />
	{/if}
{/if}

<style>
	.dev-panel {
		margin-bottom: 16px;
	}
	.dev-panel h2 {
		margin: 0 0 8px;
		font-size: 1rem;
	}
	.dev-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
		margin-block: 8px;
	}
	.dev-row input[type='text'] {
		flex: 1;
		min-inline-size: 240px;
		padding: 6px 10px;
		border: 1px solid var(--line-strong);
		border-radius: var(--radius-s);
		background: var(--bg);
		color: var(--text);
		font: inherit;
	}
	.dev-row select {
		flex: 1;
		min-inline-size: 240px;
		padding: 6px 10px;
		border: 1px solid var(--line-strong);
		border-radius: var(--radius-s);
		background: var(--bg);
		color: var(--text);
		font: inherit;
	}
	.dev-row small,
	.dev-note {
		color: var(--text-muted);
		font-size: 0.78rem;
	}
	.dev-sizes {
		display: grid;
		gap: 16px;
	}
	.dev-sizes > div {
		display: flex;
		flex-direction: column;
		gap: 6px;
		/* grid/flex の子は既定で内容幅まで広がる。長いハンドルのケースで
		   トラックごと伸びてしまうので明示的に縮められるようにする。 */
		min-inline-size: 0;
	}
	.dev-sizes small {
		color: var(--text-muted);
		font-size: 0.75rem;
	}
	.dev-hover-row {
		display: flex;
		align-items: center;
		gap: 12px;
		padding-block: 12px;
	}
	.dev-hover-static {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin-top: 8px;
	}
</style>
