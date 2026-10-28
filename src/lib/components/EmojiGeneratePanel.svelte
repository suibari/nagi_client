<script lang="ts">
	import PermissionRefreshButton from '$lib/components/PermissionRefreshButton.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import {
		ApiRequestError,
		isAuthorizationError,
		createEmojiGeneration,
		getEmojiGenerations,
	} from '$lib/api/appview';
	import type { EmojiGenerationView } from '$lib/api/types';
	import {
		createBluemojiItem,
		createBluemojiRkey,
		EMOJI_NAME_PATTERN,
	} from '$lib/atproto/bluemoji';

	type GenerateApi = {
		list: typeof getEmojiGenerations;
		create: typeof createEmojiGeneration;
		register: typeof createBluemojiItem;
	};

	let {
		onregistered,
		api = {
			list: getEmojiGenerations,
			create: createEmojiGeneration,
			register: createBluemojiItem,
		},
	}: {
		onregistered: () => Promise<void> | void;
		/** /dev/emoji-generate がモックを差し込むため。既定は AppView と PDS。 */
		api?: GenerateApi;
	} = $props();

	/** 描いている途中だけ見に行く間隔。1枚30〜45秒なので、これより細かくしても変わらない。 */
	const POLL_MS = 5_000;
	const PROMPT_MAX = 100;

	let prompt = $state('');
	let generations = $state<EmojiGenerationView[]>([]);
	let loaded = $state(false);
	let submitting = $state(false);
	let notice = $state('');
	let error = $state('');
	let needsAuthorization = $state(false);
	/** 登録中・登録済みの生成の id。候補は登録しても1日残るので、二重登録を防ぐ。 */
	let registering = $state<string>();
	let registered = $state(new Set<string>());
	/**
	 * 生成ごとの rkey。失敗して押し直しても同じ rkey で書くので、応答だけ失われていても
	 * 別の絵文字が増えない（まとめて作成の再試行と同じ）。
	 */
	const rkeys = new Map<string, string>();
	/**
	 * 生成ごとの登録フォーム。名前・説明は botたんの案を初期値にし、直してもよい。
	 * 一覧を読み直しても入力が消えないよう、生成の id で持つ。
	 */
	let forms = $state<Record<string, { name: string; description: string }>>({});

	/** 一覧を読んだら、まだフォームの無い生成に botたんの案を入れる（描画中には書き換えない）。 */
	function setGenerations(next: EmojiGenerationView[]) {
		for (const item of next)
			if (!forms[item.id]) forms[item.id] = { name: item.name, description: item.description };
		generations = next;
	}

	/**
	 * 画面は1枚だけ。描いている途中の依頼（pending）と、最新の結果（latest）を重ねて見せる。
	 * 新しい結果が出ると AppView が前の結果を消すので、一覧は多くても2件。
	 */
	const pending = $derived(
		generations.find((item) => item.state === 'queued' || item.state === 'running'),
	);
	const latest = $derived(
		generations.find((item) => item.state === 'done' || item.state === 'failed'),
	);
	const active = $derived(Boolean(pending));
	const promptLength = $derived([...new Intl.Segmenter().segment(prompt.trim())].length);

	async function load() {
		try {
			setGenerations((await api.list()).generations);
		} catch (cause) {
			error = requestErrorMessage(cause);
		} finally {
			loaded = true;
		}
	}

	$effect(() => {
		void load();
	});
	// 描いている途中のあいだだけ見に行く。完了後に画面を開いたときは1回読めば足りる
	$effect(() => {
		if (!active) return;
		const timer = setInterval(() => void load(), POLL_MS);
		return () => clearInterval(timer);
	});

	function requestErrorMessage(cause: unknown) {
		needsAuthorization = false;
		if (!(cause instanceof ApiRequestError)) return m.emojiGenerateRequestFailed();
		if (cause.code === 'already_active') return m.emojiGenerateAlreadyActive();
		if (cause.code === 'busy') return m.emojiGenerateBusy();
		if (cause.code === 'inappropriate') return m.emojiGenerateInappropriate();
		needsAuthorization = isAuthorizationError(cause);
		if (needsAuthorization) return m.emojiGeneratePermissionRequired();
		if (cause.code === 'not_configured') return m.emojiGenerateUnavailable();
		return m.emojiGenerateRequestFailed();
	}

	/** again は「もう一度描いてもらう」。同じプロンプトでも描くたびにスタイルが変わる。 */
	async function submit(again?: string) {
		const text = (again ?? prompt).trim();
		if (!text || (!again && promptLength > PROMPT_MAX) || submitting) return;
		submitting = true;
		notice = '';
		error = '';
		try {
			const result = await api.create(text);
			setGenerations([result.generation, ...generations]);
			if (!again) prompt = '';
			notice = m.emojiGenerateAccepted({
				minutes: Math.max(1, Math.round(result.estimatedWaitSeconds / 60)),
			});
		} catch (cause) {
			error = requestErrorMessage(cause);
		} finally {
			submitting = false;
		}
	}

	/** 候補は data URL で届く。fetch(data:) は CSP の connect-src に掛かりうるので自前で戻す。 */
	function dataUrlToBlob(dataUrl: string): Blob {
		const [, base64 = ''] = dataUrl.split(',', 2);
		const binary = atob(base64);
		const bytes = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
		return new Blob([bytes], { type: 'image/png' });
	}

	/** 名前と説明は botたん（gemma）の案が入っている。絵文字名は重複してよい。 */
	async function register(item: EmojiGenerationView) {
		const form = forms[item.id];
		const key = item.id;
		if (registering || registered.has(key) || !EMOJI_NAME_PATTERN.test(form.name)) return;
		registering = key;
		notice = '';
		error = '';
		try {
			// 128px の透過 PNG なので、processEmojiImage を通さずそのまま登録できる
			let rkey = rkeys.get(key);
			if (!rkey) rkeys.set(key, (rkey = createBluemojiRkey()));
			await api.register(
				form.name,
				dataUrlToBlob(item.candidates[0].image),
				form.description.trim(),
				rkey,
				{ aiGenerated: true },
			);
			registered = new Set(registered).add(key);
			notice = m.emojiGenerateRegisteredNotice({ name: form.name });
			await onregistered();
		} catch (cause) {
			needsAuthorization = isAuthorizationError(cause);
			error = needsAuthorization
				? m.emojiGeneratePermissionRequired()
				: cause instanceof Error
					? cause.message
					: m.emojiUploadFailed();
		} finally {
			registering = undefined;
		}
	}

	function stateText(item: EmojiGenerationView) {
		if (item.state === 'queued') return m.emojiGenerateQueued({ ahead: item.queuePosition ?? 0 });
		if (item.state === 'running')
			return latest?.state === 'done' ? m.emojiGenerateRedrawing() : m.emojiGenerateRunning();
		if (item.state === 'failed') return m.emojiGenerateFailed();
		return m.emojiGenerateChoose();
	}
</script>

{#snippet again(item: EmojiGenerationView)}
	<button
		type="button"
		class="avatar-select"
		disabled={submitting || active}
		onclick={() => submit(item.prompt)}>{m.emojiGenerateAgain()}</button
	>
{/snippet}

<div class="emoji-generate">
	<p>{m.emojiGenerateNote()}</p>
	<form
		class="emoji-generate-form"
		onsubmit={(event) => {
			event.preventDefault();
			void submit();
		}}
	>
		<label
			>{m.emojiGeneratePromptLabel()}<input
				bind:value={prompt}
				maxlength={PROMPT_MAX * 2}
				placeholder={m.emojiGeneratePromptPlaceholder()}
				disabled={submitting}
			/></label
		>
		<button
			class="primary"
			disabled={submitting || active || !prompt.trim() || promptLength > PROMPT_MAX}
			>{submitting ? m.emojiGenerateSubmitting() : m.emojiGenerateSubmit()}</button
		>
	</form>
	{#if notice}<p role="status">{notice}</p>{/if}
	{#if error}
		<p class="error" role="alert">{error}</p>
		{#if needsAuthorization}<PermissionRefreshButton />{/if}
	{/if}

	{#if !loaded}
		<Spinner />
	{:else if pending || latest}
		{@const shown = pending ?? latest!}
		{@const done = latest?.state === 'done' ? latest : undefined}
		<section class="emoji-generate-item" aria-busy={Boolean(pending)}>
			<div class="emoji-generate-head">
				<strong>{shown.prompt}</strong>
				<small>{pending ? stateText(pending) : stateText(latest!)}</small>
			</div>
			{#if done || pending}
				<div class="emoji-generate-candidate">
					<!-- 描き直している間は、前の絵の上にスピナーを重ねる。描き終えたら差し替わる -->
					<div class="emoji-generate-preview" class:busy={Boolean(pending)}>
						{#if done?.candidates[0]}<img
								src={done.candidates[0].image}
								alt={done.prompt}
								width={done.candidates[0].width}
								height={done.candidates[0].height}
							/>{/if}
						{#if pending}<span class="emoji-generate-spinner"><Spinner size="sm" /></span>{/if}
					</div>
					{#if done}{@render again(done)}{/if}
				</div>
			{/if}
			{#if done}
				{@const form = forms[done.id]}
				<label
					>{m.emojiNameLabel()}<input
						bind:value={form.name}
						maxlength="32"
						placeholder="blobcat"
					/></label
				>
				{#if !EMOJI_NAME_PATTERN.test(form.name)}<p class="error">{m.emojiNameInvalid()}</p>{/if}
				<label>{m.emojiAltLabel()}<input bind:value={form.description} maxlength="100" /></label>
				<button
					class="primary"
					disabled={Boolean(registering) ||
						registered.has(done.id) ||
						!EMOJI_NAME_PATTERN.test(form.name)}
					onclick={() => register(done)}
					>{registered.has(done.id)
						? m.emojiGenerateRegistered()
						: registering === done.id
							? m.saving()
							: m.emojiUpload()}</button
				>
			{:else if latest?.state === 'failed' && !pending}
				<!-- 描けなかったときは絵が無いので、ボタンだけを出す -->
				{@render again(latest)}
			{/if}
		</section>
	{/if}
</div>
