<script lang="ts">
	import { untrack } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import Icon from './shell/Icon.svelte';
	import PostScopeDialog from './PostScopeDialog.svelte';
	import { getLastPostScope, setLastPostScope, type PostScope } from '$lib/post/scope';
	import { generateTrilinesAssist } from '$lib/api/appview';
	import { i18n, m } from '$lib/i18n/i18n.svelte';
	import { languagePreferences } from '$lib/i18n/languagePreferences.svelte';
	import { ImageProcessingError, processImage, releaseImage } from '$lib/images';
	import { session, signIn } from '$lib/oauth/session.svelte';
	import { grantedOptIns } from '$lib/optin/scope-optin';
	import { getCrosspostEnabled, hasCrosspostScope } from '$lib/crosspost/preferences';
	import type { TrilinesEditTarget } from '$lib/post/composer-host.svelte';
	import { consultRange } from '$lib/trilines/date';
	import {
		TRILINES_IMAGE_MAX_BYTES,
		TRILINES_LINE_MAX_GRAPHEMES,
		TRILINES_ORIGIN,
		attachSharedPost,
		createTrilinesDiary,
		emptyTrilinesLines,
		getOwnTrilinesDiary,
		graphemeCount,
		hasTrilinesDiaryToday,
		hasTrilinesScope,
		trilinesSubmittable,
		updateTrilinesDiary,
		type TrilinesLineDraft,
	} from '$lib/trilines/records';
	import { crosspostTrilinesToBluesky } from '$lib/trilines/share';

	/**
	 * 3行日記の入力欄。ポストモーダルの「3行日記」タブで Composer の代わりに出す。
	 *
	 * 正本は本人の PDS の com.suibari.trilinesat.diary。TriLinesAt と同じレコードを書くので、
	 * どちらのアプリからでも読める。「botたんに相談」は空いている行だけを下書きで埋め、投稿はしない。
	 */
	let {
		editTarget,
		active = true,
		submittable = $bindable(false),
		onsendingchange,
		onposted,
	}: {
		editTarget?: TrilinesEditTarget;
		/** タブが選ばれているか。隠れている間は今日の日記の確認や権限の確認をしない。 */
		active?: boolean;
		submittable?: boolean;
		onsendingchange?: (sending: boolean) => void;
		onposted?: (uri: string) => void;
	} = $props();

	let lines = $state<TrilinesLineDraft[]>(emptyTrilinesLines());
	let busy = $state(false);
	let error = $state('');
	let warning = $state('');
	let processingIndex = $state<number | undefined>(undefined);
	let consulting = $state(false);
	let consultMessage = $state('');
	let consultFailed = $state(false);
	let writtenToday = $state(false);
	let scopeReady = $state(true);
	let reauthorizing = $state(false);
	let crosspostReady = $state(false);
	/**
	 * 公開範囲。日記は PDS の公開レコード（TriLinesAt からも読める）なので、こっそりは選べない。
	 * 「Blueskyにも」は Composer と同じくクロスポストの有効化と権限がそろったときだけ選べる。
	 */
	let scope = $state<PostScope>('feed');
	let scopeDialogOpen = $state(false);
	let loadedEditUri: string | undefined;
	let fileInputs = $state<HTMLInputElement[]>([]);

	const editing = $derived(Boolean(editTarget));
	const scopeLabel = $derived(
		scope === 'external' ? m.postScopeBlueskyShort() : m.postScopeFeedShort(),
	);
	const canSubmit = $derived(
		!busy && scopeReady && processingIndex === undefined && trilinesSubmittable(lines),
	);
	$effect(() => {
		submittable = canSubmit;
	});

	// 開いたとき（タブが選ばれたとき）に、今日の日記・権限・Bluesky 連携の状態を読み直す。
	$effect(() => {
		const did = $session?.did;
		if (!active || !did) return;
		const isEditing = untrack(() => editing);
		void hasTrilinesScope().then((granted) => {
			if ($session?.did === did) scopeReady = granted;
		});
		if (!isEditing)
			void hasTrilinesDiaryToday().then((value) => {
				if ($session?.did === did) writtenToday = value;
			});
		void (
			getCrosspostEnabled() ? hasCrosspostScope().catch(() => false) : Promise.resolve(false)
		).then((granted) => {
			if ($session?.did !== did) return;
			crosspostReady = granted;
			// 前回の投稿範囲を引き継ぐ。こっそりは日記では選べないので、通常の公開に読み替える。
			scope = granted && getLastPostScope() === 'external' ? 'external' : 'feed';
		});
	});

	// 編集するときは PDS の正本から行と画像の BlobRef を読み込む（表示用の PostView には BlobRef が無い）。
	$effect(() => {
		const target = editTarget;
		if (!target || target.uri === loadedEditUri) return;
		loadedEditUri = target.uri;
		const rkey = target.uri.slice(target.uri.lastIndexOf('/') + 1);
		error = '';
		void getOwnTrilinesDiary(rkey)
			.then(({ value }) => {
				if (loadedEditUri !== target.uri) return;
				const previews = target.post.images ?? [];
				let imageCursor = 0;
				const loaded: TrilinesLineDraft[] = value.lines.map((line) => ({
					text: line.text,
					alt: line.alt ?? '',
					...(line.image
						? {
								image: {
									kind: 'existing' as const,
									blob: line.image,
									previewUrl: previews[imageCursor++]?.url ?? '',
								},
							}
						: {}),
				}));
				replaceLines([...loaded, ...emptyTrilinesLines()].slice(0, 3));
			})
			.catch(() => {
				error = m.trilinesFailed();
			});
	});

	function replaceLines(next: TrilinesLineDraft[]) {
		for (const line of lines)
			if (line.image?.kind === 'new' && !next.some((item) => item.image === line.image))
				releaseImage(line.image.attachment);
		lines = next;
	}

	function reset() {
		replaceLines(emptyTrilinesLines());
		consultMessage = '';
		consultFailed = false;
		loadedEditUri = undefined;
	}

	async function pickImage(index: number, file: File | undefined) {
		if (!file || processingIndex !== undefined) return;
		error = '';
		processingIndex = index;
		try {
			const attachment = await processImage(file, undefined, TRILINES_IMAGE_MAX_BYTES);
			const previous = lines[index].image;
			lines[index] = { ...lines[index], image: { kind: 'new', attachment } };
			if (previous?.kind === 'new') releaseImage(previous.attachment);
		} catch (cause) {
			error =
				cause instanceof ImageProcessingError && cause.code === 'type'
					? m.postImageTypeError({ name: file.name })
					: cause instanceof ImageProcessingError && cause.code === 'input-size'
						? m.postImageInputSizeError({ name: file.name })
						: m.postImageCompressError({ name: file.name });
		} finally {
			processingIndex = undefined;
		}
	}

	function removeImage(index: number) {
		const previous = lines[index].image;
		lines[index] = { text: lines[index].text, alt: '' };
		if (previous?.kind === 'new') releaseImage(previous.attachment);
	}

	const previewOf = (line: TrilinesLineDraft) =>
		line.image?.kind === 'new' ? line.image.attachment.previewUrl : line.image?.previewUrl;

	async function consult() {
		if (consulting || busy) return;
		consultFailed = false;
		const current = lines.map((line) => line.text.trim());
		if (current.every(Boolean)) {
			consultMessage = m.trilinesConsultFull();
			return;
		}
		consulting = true;
		consultMessage = '';
		try {
			const { from, to } = consultRange();
			const result = await generateTrilinesAssist({
				from: from.toISOString(),
				to: to.toISOString(),
				lines: current,
				lang: i18n.locale === 'en' ? 'en' : 'ja',
			});
			if (result.reason === 'noPosts') {
				consultMessage = m.trilinesConsultNoPosts();
				return;
			}
			// 待っている間に書かれた行は上書きしない。
			lines = lines.map((line, index) =>
				line.text.trim() ? line : { ...line, text: result.lines[index] ?? '' },
			);
			consultMessage = m.trilinesConsultDone();
		} catch {
			consultFailed = true;
			consultMessage = m.trilinesConsultFailed();
		} finally {
			consulting = false;
		}
	}

	async function authorize() {
		if (!$session || reauthorizing) return;
		reauthorizing = true;
		try {
			await signIn($session.did, { ...(await grantedOptIns()), refreshPermissions: true });
		} finally {
			reauthorizing = false;
		}
	}

	export async function submit() {
		if (!canSubmit) return;
		busy = true;
		error = '';
		warning = '';
		onsendingchange?.(true);
		try {
			if (editTarget) {
				const updated = await updateTrilinesDiary(editTarget.uri, lines);
				reset();
				onposted?.(updated.uri);
				return;
			}
			const created = await createTrilinesDiary(lines, [languagePreferences.postLanguage]);
			if (scope === 'external' && crosspostReady) {
				try {
					const shared = await crosspostTrilinesToBluesky(created, lines, {
						template: m.trilinesShareTemplate(),
						link: m.trilinesShareLink(),
					});
					await attachSharedPost(created, shared).catch(() => undefined);
				} catch {
					warning = m.trilinesShareFailed();
				}
			}
			reset();
			writtenToday = true;
			onposted?.(created.uri);
		} catch {
			error = m.trilinesFailed();
		} finally {
			busy = false;
			onsendingchange?.(false);
		}
	}
</script>

<section class="composer trilines-composer" aria-label={m.postModeDiary()}>
	<div class="trilines-head">
		<p class="trilines-intro">
			{editing ? m.trilinesEditTitle() : m.trilinesIntro()}
			<a href={TRILINES_ORIGIN} target="_blank" rel="noopener">{m.trilinesPublicNote()}</a>
		</p>
		{#if !editing}
			<!--
				説明は常に出さず、ボタン内のヘルプマークからツールチップで読ませる（モーダルを詰めるため）。
				button の中に別の操作要素は置けないので、マークは飾りにしてボタン自体の hover/focus で出す。
			-->
			<span class="trilines-consult">
				<Button
					variant="secondary"
					size="sm"
					type="button"
					class="trilines-consult-button"
					disabled={busy || consulting || !scopeReady}
					aria-describedby="trilines-consult-help"
					onclick={consult}
				>
					{#if consulting}<Spinner inline size="sm" decorative />
					{:else}<!-- 線画をマスクにして文字色で塗る（ほかのアイコンと色をそろえる）。 --><Icon
							name="bot"
							size={18}
						/>{/if}
					<span>{consulting ? m.trilinesConsulting() : m.trilinesConsult()}</span>
					<span class="trilines-help-mark" aria-hidden="true"><Icon name="info" size={14} /></span>
				</Button>
				<span id="trilines-consult-help" class="trilines-tooltip" role="tooltip"
					>{m.trilinesConsultHelp()}</span
				>
			</span>
		{/if}
	</div>
	{#if consultMessage}
		<p class="trilines-consult-note" class:error={consultFailed} role="status" aria-live="polite">
			{consultMessage}
		</p>
	{/if}
	{#if !scopeReady}
		<div class="trilines-permission">
			<p>{m.trilinesReauthNote()}</p>
			<Button
				variant="secondary"
				size="sm"
				type="button"
				disabled={reauthorizing}
				onclick={authorize}
			>
				{reauthorizing ? m.standardSiteReauthPending() : m.standardSiteReauthSubmit()}
			</Button>
		</div>
	{/if}
	{#if writtenToday && !editing}
		<p class="trilines-today" role="status">{m.trilinesAlreadyToday()}</p>
	{/if}

	<ol class="trilines-lines">
		{#each lines as line, index (index)}
			{@const count = graphemeCount(line.text.trim())}
			{@const preview = previewOf(line)}
			<li class="trilines-line">
				<label class="visually-hidden" for={`trilines-line-${index}`}
					>{m.trilinesLineLabel({ n: index + 1 })}</label
				>
				<div class="trilines-line-row">
					<span class="trilines-line-number" aria-hidden="true">{index + 1}</span>
					<input
						id={`trilines-line-${index}`}
						class="trilines-input"
						type="text"
						bind:value={line.text}
						placeholder={m.trilinesLinePlaceholder({ n: index + 1 })}
						disabled={busy}
						autocomplete="off"
						aria-invalid={count > TRILINES_LINE_MAX_GRAPHEMES}
					/>
					<span class="trilines-count" class:over={count > TRILINES_LINE_MAX_GRAPHEMES}
						>{count}/{TRILINES_LINE_MAX_GRAPHEMES}</span
					>
					<button
						class="icon-action"
						type="button"
						disabled={busy || processingIndex !== undefined}
						aria-label={m.trilinesAddImage()}
						title={m.trilinesAddImage()}
						onclick={() => fileInputs[index]?.click()}
					>
						{#if processingIndex === index}<Spinner inline size="sm" decorative />
						{:else}<Icon name="image" size={18} />{/if}
					</button>
					<input
						bind:this={fileInputs[index]}
						class="visually-hidden"
						type="file"
						accept="image/jpeg,image/png,image/webp,image/gif"
						tabindex="-1"
						onchange={(event) => {
							const input = event.currentTarget;
							void pickImage(index, input.files?.[0]);
							input.value = '';
						}}
					/>
				</div>
				{#if line.image}
					<div class="trilines-image">
						{#if preview}<img src={preview} alt="" />{/if}
						<input
							class="trilines-alt"
							type="text"
							bind:value={line.alt}
							maxlength={1000}
							placeholder={m.trilinesAltPlaceholder()}
							disabled={busy}
						/>
						<button
							class="icon-action"
							type="button"
							disabled={busy}
							aria-label={m.trilinesRemoveImage()}
							title={m.trilinesRemoveImage()}
							onclick={() => removeImage(index)}><Icon name="close" size={16} /></button
						>
					</div>
				{/if}
			</li>
		{/each}
	</ol>

	<div class="trilines-foot">
		{#if !editing}
			<!-- 公開範囲は Composer と同じボタンとゲージ（PostScopeDialog）で選ぶ。 -->
			<button
				class="scope-button"
				type="button"
				disabled={busy}
				aria-haspopup="dialog"
				aria-expanded={scopeDialogOpen}
				aria-label={m.postScopeOpenAria({ scope: scopeLabel })}
				title={m.postScopeOpenAria({ scope: scopeLabel })}
				onclick={() => (scopeDialogOpen = true)}
			>
				<Icon name={scope === 'external' ? 'bluesky' : 'home'} size={15} />
				<span>{scopeLabel}</span>
			</button>
		{/if}
		<div class="composer-submit-actions">
			<Button
				variant="primary"
				class="submit-primary"
				type="button"
				disabled={!canSubmit}
				aria-label={busy ? m.composerSubmitting() : editing ? m.trilinesSave() : m.trilinesSubmit()}
				onclick={() => submit()}
			>
				{#if busy}<Spinner inline size="sm" decorative />
				{:else}<Icon name="send" size={18} />{/if}
				<span
					>{busy
						? m.composerSubmitting()
						: editing
							? m.trilinesSave()
							: m.composerSubmitNagiShort()}</span
				>
			</Button>
		</div>
	</div>
	{#if error}<p class="error" role="alert">{error}</p>{/if}
	{#if warning}<p class="error">{m.postedWithWarning({ reason: warning })}</p>{/if}
</section>
{#if scopeDialogOpen}
	<PostScopeDialog
		{scope}
		externalEligible={crosspostReady}
		externalDisabledReason={m.postScopeExternalUnavailable()}
		kossoriDisabled
		kossoriDisabledReason={m.trilinesScopeKossori()}
		onselect={(next) => {
			scope = next;
			setLastPostScope(next);
		}}
		onclose={() => (scopeDialogOpen = false)}
	/>
{/if}

<style>
	.trilines-composer {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.trilines-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 10px;
	}
	.trilines-intro,
	.trilines-consult-note {
		margin: 0;
		color: var(--text-sub);
		font-size: 13px;
	}
	.trilines-intro {
		flex: 1;
		min-width: 0;
	}
	.trilines-intro a {
		color: var(--text-sub);
		text-decoration: underline;
		text-underline-offset: 2px;
	}
	.trilines-consult-note {
		text-align: end;
	}
	.trilines-consult {
		position: relative;
		flex-shrink: 0;
	}
	.trilines-help-mark {
		display: inline-flex;
		color: var(--text-muted);
	}
	.trilines-tooltip {
		position: absolute;
		top: calc(100% + 6px);
		right: 0;
		z-index: 5;
		width: max-content;
		max-width: min(260px, 80vw);
		padding: 6px 9px;
		border: 1px solid var(--line-strong);
		border-radius: var(--r-sm);
		background: var(--surface-1);
		box-shadow: var(--shadow-pop);
		color: var(--text-sub);
		font-size: 12px;
		line-height: 1.5;
		pointer-events: none;
		opacity: 0;
		visibility: hidden;
		transition: opacity 120ms ease;
	}
	.trilines-consult:hover .trilines-tooltip,
	.trilines-consult:focus-within .trilines-tooltip {
		opacity: 1;
		visibility: visible;
	}
	.trilines-today {
		margin: 0;
		padding: 8px 10px;
		border: 1px solid var(--line-strong);
		border-radius: var(--r-sm);
		background: var(--surface-2);
		color: var(--text);
		font-size: 13px;
	}
	.trilines-permission {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;
		font-size: 13px;
	}
	.trilines-permission p {
		margin: 0;
	}
	.trilines-lines {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.trilines-line {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.trilines-line-row,
	.trilines-image {
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 0;
	}
	.trilines-line-number {
		flex-shrink: 0;
		width: 22px;
		color: var(--text-muted);
		font-size: 13px;
		font-weight: 700;
		text-align: center;
	}
	.trilines-input,
	.trilines-alt {
		flex: 1;
		min-width: 0;
		padding: 8px 10px;
		border: 1px solid var(--line-strong);
		border-radius: var(--r-sm);
		background: var(--surface-1);
		color: var(--text);
		font: inherit;
	}
	.trilines-input {
		font-size: 15px;
	}
	.trilines-alt {
		font-size: 13px;
	}
	.trilines-input[aria-invalid='true'] {
		border-color: var(--danger);
	}
	.trilines-count {
		flex-shrink: 0;
		min-width: 40px;
		color: var(--text-muted);
		font-size: 12px;
		font-variant-numeric: tabular-nums;
		text-align: end;
	}
	.trilines-count.over {
		color: var(--danger);
	}
	.trilines-image {
		padding-inline-start: 30px;
	}
	.trilines-image img {
		flex-shrink: 0;
		width: 56px;
		height: 56px;
		border-radius: var(--r-sm);
		object-fit: cover;
		background: var(--surface-2);
	}
	.trilines-foot {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		padding-top: 10px;
		border-top: 1px solid var(--line);
	}
	.trilines-foot .composer-submit-actions {
		margin-inline-start: auto;
	}
	@media (max-width: 767px) {
		.trilines-count {
			min-width: 34px;
		}
		/* 狭い画面ではモーダル上端の送信ボタンを使う（Composer の .composer-foot と同じ扱い）。 */
		:global(.post-modal.has-header-action .trilines-foot .submit-primary) {
			display: none;
		}
	}
</style>
