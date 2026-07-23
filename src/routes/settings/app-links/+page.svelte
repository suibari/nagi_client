<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { page } from '$app/state';
	import { m } from '$lib/i18n/i18n.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import ToggleSwitch from '$lib/components/ToggleSwitch.svelte';
	import AppLinkCard from '$lib/components/AppLinkCard.svelte';
	import {
		getOwnAppLinks,
		putAppLinks,
		listOwnCollections,
		fetchOwnLatestRecord,
		resolveOwnPdsUrl,
		collectLeaves,
		collectArrayCandidates,
		getByPath,
		sampleText,
		autoSelectFields,
		buildLinkView,
		resolveAppIcon,
		suggestAppUri,
		type AppLink,
		type AppLinkFieldRole,
		type AppLinkView,
		type ArrayCandidate,
	} from '$lib/atproto/appLinks';

	type FieldChoice = { path: string; sample: string; role: AppLinkFieldRole; shown: boolean };
	type LinkEditor = {
		collection: string;
		label: string;
		appUri: string;
		iconUrl: string;
		savedPaths: string[];
		/** repeat 展開する配列のキーパス（未使用時は ''）。 */
		repeat: string;
		/** レコードから検出した repeat 候補配列。 */
		arrayCandidates: ArrayCandidate[];
		isNew: boolean;
		record: Record<string, unknown> | null;
		choices: FieldChoice[];
		expanded: boolean;
		loading: boolean;
		loaded: boolean;
	};

	let editors = $state<LinkEditor[]>([]);
	let discovered = $state<string[]>([]);
	let discoveredIcons = $state<Record<string, string>>({});
	let ownDid = $state('');
	let ownPdsUrl = $state('');
	let loaded = $state(false);
	let saving = $state(false);
	let saveState = $state<'idle' | 'saved' | 'failed'>('idle');

	function toEditor(link: AppLink): LinkEditor {
		return {
			collection: link.collection,
			label: link.label ?? '',
			appUri: link.appUri ?? '',
			iconUrl: link.iconUrl ?? '',
			savedPaths: (link.fields ?? []).map((f) => f.path),
			repeat: link.repeat ?? '',
			arrayCandidates: [],
			isNew: false,
			record: null,
			choices: [],
			expanded: false,
			loading: false,
			loaded: false,
		};
	}

	/** repeat の有無に応じてフィールド候補を組み立てる（repeat 時は配列の先頭要素を走査）。 */
	function computeChoices(editor: LinkEditor, autoDefault: boolean): FieldChoice[] {
		if (!editor.record) return [];
		const base = editor.repeat
			? getByPath(editor.record, editor.repeat)
			: editor.record;
		const element =
			editor.repeat && Array.isArray(base) ? (base[0] as Record<string, unknown>) : base;
		if (!element || typeof element !== 'object') return [];
		const target = element as Record<string, unknown>;
		const shown = new Set(autoDefault ? autoSelectFields(target) : editor.savedPaths);
		return collectLeaves(target).map((l) => ({
			path: l.path,
			sample: sampleText(l),
			role: l.role,
			shown: shown.has(l.path),
		}));
	}

	/** リスト展開トグル。ON で配列候補を検出し先頭を repeat に採用、OFF で単一表示へ戻す。 */
	function toggleRepeat(editor: LinkEditor, on: boolean) {
		if (on) {
			if (!editor.arrayCandidates.length) return;
			editor.repeat = editor.arrayCandidates[0].path;
		} else {
			editor.repeat = '';
		}
		editor.choices = computeChoices(editor, true);
	}

	/** 展開対象の配列を切り替える（候補が複数あるとき）。 */
	function selectRepeat(editor: LinkEditor, path: string) {
		editor.repeat = path;
		editor.choices = computeChoices(editor, true);
	}

	let brokenIcons = $state<Set<string>>(new Set());

	// 未追加の（＝すでに編集中でない）discovery 候補。
	let availableCollections = $derived(
		discovered.filter((c) => !editors.some((e) => e.collection === c)),
	);

	const appHome = (c: string) => suggestAppUri(c) ?? '';

	// アプリ内で「メタ」っぽいコレクションを避けて代表を選ぶ。
	function pickRep(cols: string[]): string {
		const meta = /\.(profile|declaration|preference|preferences|settings|status|self)$/;
		const content = cols.filter((c) => !meta.test(c));
		const pool = content.length ? content : cols;
		return [...pool].sort((a, b) => a.split('.').length - b.split('.').length || a.localeCompare(b))[0];
	}

	// discovery はコレクション単位ではなくアプリ単位でまとめる（同じ favicon が並ぶのを防ぎ、
	// favicon 解決も 1 アプリ 1 回でレート制限に収める）。favicon が解決したものだけ表示。
	let appGroups = $derived.by(() => {
		const map = new Map<string, string[]>();
		for (const c of availableCollections) {
			const home = appHome(c);
			if (!home) continue;
			(map.get(home) ?? map.set(home, []).get(home)!).push(c);
		}
		return [...map.entries()]
			.map(([home, cols]) => ({ home, rep: pickRep(cols) }))
			.filter((g) => discoveredIcons[g.home] && !brokenIcons.has(g.home))
			.sort((a, b) => a.home.localeCompare(b.home));
	});

	onMount(async () => {
		if (!$session) {
			loaded = true;
			return;
		}
		ownDid = $session.did;
		try {
			const [links, cols, pds] = await Promise.all([
				getOwnAppLinks(),
				listOwnCollections().catch(() => [] as string[]),
				resolveOwnPdsUrl().catch(() => ''),
			]);
			editors = links.map(toEditor);
			discovered = cols;
			ownPdsUrl = pds;
			// 既存カードのプレビュー用にレコードを先読み。
			await Promise.all(editors.map((e) => ensureLoaded(e)));
			// discovery 候補の favicon を裏で解決。
			void resolveDiscoveredIcons(cols);
			// ?edit=<collection> があれば該当連携を開く。
			const target = page.url.searchParams.get('edit');
			if (target) {
				const editor = editors.find((e) => e.collection === target);
				if (editor) {
					editor.expanded = true;
					await tick();
					document.getElementById(`link-${target}`)?.scrollIntoView({ block: 'center' });
				}
			}
		} finally {
			loaded = true;
		}
	});

	async function resolveDiscoveredIcons(cols: string[]) {
		// アプリ（ホーム URL）単位で一意化してから解決する。
		const homes = [...new Set(cols.map(appHome).filter(Boolean))];
		await Promise.all(
			homes.map(async (home) => {
				const icon = await resolveAppIcon(home);
				if (icon) discoveredIcons = { ...discoveredIcons, [home]: icon };
			}),
		);
	}

	async function ensureLoaded(editor: LinkEditor) {
		if (editor.loaded || editor.loading || !editor.collection.trim()) return;
		editor.loading = true;
		try {
			const record = await fetchOwnLatestRecord(editor.collection.trim());
			editor.record = record;
			if (record) {
				editor.arrayCandidates = collectArrayCandidates(record);
				editor.choices = computeChoices(editor, editor.isNew);
			}
			// favicon 自動取得（未設定時）。
			if (!editor.iconUrl) {
				if (!editor.appUri) editor.appUri = suggestAppUri(editor.collection.trim()) ?? '';
				if (editor.appUri) {
					const icon = await resolveAppIcon(editor.appUri);
					if (icon) editor.iconUrl = icon;
				}
			}
		} finally {
			editor.loading = false;
			editor.loaded = true;
		}
	}

	async function addCollection(collection: string) {
		const c = collection.trim();
		if (!c) return;
		const existing = editors.find((e) => e.collection === c);
		if (existing) {
			existing.expanded = true;
			return;
		}
		const editor: LinkEditor = {
			collection: c,
			label: c.split('.').slice(-2).join('.'),
			appUri: '',
			iconUrl: discoveredIcons[appHome(c)] ?? '',
			savedPaths: [],
			repeat: '',
			arrayCandidates: [],
			isNew: true,
			record: null,
			choices: [],
			expanded: true,
			loading: false,
			loaded: false,
		};
		// push した生オブジェクトではなく、$state 配列がラップしたプロキシ要素を辿って渡す。
		// 生参照経由のミューテーションはリアクティブに反映されない（UI が「取得中…」のまま固まる）。
		const idx = editors.push(editor) - 1;
		await ensureLoaded(editors[idx]);
	}

	function removeLink(index: number) {
		editors.splice(index, 1);
	}

	async function toggleExpand(editor: LinkEditor) {
		editor.expanded = !editor.expanded;
		if (editor.expanded) await ensureLoaded(editor);
	}

	async function refetchIcon(editor: LinkEditor) {
		if (!editor.appUri.trim()) return;
		const icon = await resolveAppIcon(editor.appUri.trim());
		if (icon) editor.iconUrl = icon;
	}

	function fieldName(path: string): string {
		return path.split('.').pop() ?? path;
	}

	// プレビュー用ビュー（putRecord せず、選択中フィールドを実レコードに適用して即時反映）。
	function previewOf(editor: LinkEditor): AppLinkView {
		const link = {
			collection: editor.collection,
			label: editor.label,
			appUri: editor.appUri || undefined,
			iconUrl: editor.iconUrl || undefined,
			repeat: editor.repeat || undefined,
			fields: editor.choices.filter((c) => c.shown).map((c) => ({ path: c.path })),
		};
		if (!editor.record) {
			return {
				collection: editor.collection,
				label: editor.label || editor.collection,
				appUri: link.appUri,
				iconUrl: link.iconUrl,
				records: [],
			};
		}
		return buildLinkView(ownDid, ownPdsUrl, link, editor.record);
	}

	async function save() {
		saving = true;
		saveState = 'idle';
		try {
			const links: AppLink[] = editors
				.filter((e) => e.collection.trim())
				.map((e) => ({
					collection: e.collection.trim(),
					label: e.label.trim() || e.collection.trim(),
					selection: 'latest',
					...(e.repeat.trim() ? { repeat: e.repeat.trim() } : {}),
					...(e.appUri.trim() ? { appUri: e.appUri.trim() } : {}),
					...(e.iconUrl.trim() ? { iconUrl: e.iconUrl.trim() } : {}),
					fields: (e.loaded
						? e.choices.filter((c) => c.shown).map((c) => c.path)
						: e.savedPaths
					).map((path) => ({ path })),
				}));
			await putAppLinks(links);
			saveState = 'saved';
		} catch {
			saveState = 'failed';
		} finally {
			saving = false;
		}
	}
</script>

<section class="auth-card settings-detail">
	<a class="settings-back" href="/settings">← {m.backToSettings()}</a>
	<h1>{m.settingsAppLinksTitle()}</h1>
	<fieldset class="theme-settings">
		<legend>{m.appLinksLegend()}</legend>
		<p>{m.appLinksHelp()}</p>
		<p class="muted">{m.appLinksPublicNote()}</p>

		{#if !$session}
			<p>{m.appLinksSignInRequired()}</p>
		{:else if !loaded}
			<p>{m.loading()}</p>
		{:else}
			{#if appGroups.length}
				<div class="discover">
					<span class="muted">{m.appLinksFromRepoHint()}</span>
					<div class="favicons">
						{#each appGroups as g (g.home)}
							<button type="button" class="favicon-btn" title={g.rep} onclick={() => addCollection(g.rep)}>
								<img
									src={discoveredIcons[g.home]}
									alt=""
									width="24"
									height="24"
									onerror={() => (brokenIcons = new Set(brokenIcons).add(g.home))}
								/>
							</button>
						{/each}
					</div>
				</div>
			{/if}

			{#each editors as editor, i (editor.collection + i)}
				<div class="link" id={`link-${editor.collection}`}>
					<AppLinkCard
						link={previewOf(editor)}
						editable
						editing={editor.expanded}
						onedit={() => toggleExpand(editor)}
					/>
					{#if editor.expanded}
						<div class="editor">
							<label class="field">
								<span>{m.appLinksLabelLabel()}</span>
								<input type="text" placeholder={editor.collection} bind:value={editor.label} />
							</label>

							<label class="field">
								<span>{m.appLinksAppUriLabel()}</span>
								<span class="with-button">
									<input type="url" placeholder="https://" bind:value={editor.appUri} />
									<button type="button" disabled={!editor.appUri.trim()} onclick={() => refetchIcon(editor)}>
										{m.appLinksResolveIcon()}
									</button>
								</span>
							</label>

							{#if editor.loading}
								<p class="muted">{m.appLinksLoadingSample()}</p>
							{:else if !editor.record}
								<p class="muted">{m.appLinksNoSample()}</p>
							{:else}
								{#if editor.arrayCandidates.length}
									<div class="field-row expand-row">
										<ToggleSwitch
											checked={!!editor.repeat}
											label={m.appLinksExpandList()}
											onchange={(v) => toggleRepeat(editor, v)}
										/>
									</div>
									{#if editor.repeat && editor.arrayCandidates.length > 1}
										<label class="field">
											<span>{m.appLinksArrayField()}</span>
											<select
												class="add-select"
												value={editor.repeat}
												onchange={(e) => selectRepeat(editor, e.currentTarget.value)}
											>
												{#each editor.arrayCandidates as cand (cand.path)}
													<option value={cand.path}>{cand.path} ({cand.length})</option>
												{/each}
											</select>
										</label>
									{/if}
								{/if}
								<p class="fields-hint muted">{m.appLinksChooseFields()}</p>
								<div class="field-list">
									{#each editor.choices as choice (choice.path)}
										<div class="field-row" title={`${choice.path}: ${choice.sample}`}>
											<ToggleSwitch
												checked={choice.shown}
												label={fieldName(choice.path)}
												onchange={(v) => (choice.shown = v)}
											/>
										</div>
									{/each}
								</div>
							{/if}

							<button type="button" class="remove" onclick={() => removeLink(i)}>{m.appLinksRemove()}</button>
						</div>
					{/if}
				</div>
			{/each}

			{#if availableCollections.length}
				<div class="add-row">
					<select
						class="add-select"
						aria-label={m.appLinksAddSelect()}
						onchange={(e) => {
							const v = e.currentTarget.value;
							e.currentTarget.value = '';
							if (v) void addCollection(v);
						}}
					>
						<option value="" selected>{m.appLinksAddSelect()}</option>
						{#each availableCollections as c (c)}<option value={c}>{c}</option>{/each}
					</select>
				</div>
			{/if}

			<div class="actions">
				<button type="button" class="primary save" disabled={saving} onclick={save}>
					{saving ? m.appLinksSaving() : m.appLinksSave()}
				</button>
			</div>
			{#if editors.length === 0}<p class="muted">{m.appLinksEmpty()}</p>{/if}
			{#if saveState === 'saved'}<p class="ok">{m.appLinksSaved()}</p>{/if}
			{#if saveState === 'failed'}<p class="error-text">{m.appLinksSaveFailed()}</p>{/if}
		{/if}
	</fieldset>
</section>

<style>
	/* このページはフォーム主体なので、継承される中央寄せ(.auth-card)を左寄せに統一する。 */
	.theme-settings {
		text-align: left;
		/* .settings-detail は display:grid で、この fieldset はグリッドアイテム。既定の
		   min-width:auto だと、折り返せない長い URL の min-content 幅がカード(450px)を突き破る。
		   0 に下げて内側の flex 省略(ellipsis)を効かせる。 */
		min-inline-size: 0;
	}
	/* カード自身もグリッド／フレックス文脈で縮めるようにして横あふれを防ぐ。 */
	.link {
		min-inline-size: 0;
	}
	.muted {
		color: var(--text-muted);
		font-size: 0.85rem;
	}
	.discover {
		margin-block: 0.6rem;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}
	.favicons {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		max-block-size: 7rem;
		overflow-y: auto;
		padding: 0.1rem;
	}
	.favicon-btn {
		inline-size: 2.1rem;
		block-size: 2.1rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--line);
		border-radius: var(--radius-m);
		background: var(--bg-inset);
		cursor: pointer;
		padding: 0;
		flex: none;
	}
	.favicon-btn:hover {
		border-color: var(--accent);
	}
	.favicon-btn img {
		border-radius: var(--radius-s);
	}
	.link {
		margin-block: 0.6rem;
	}
	.editor {
		border: 1px solid var(--line);
		border-block-start: 0;
		border-radius: 0 0 var(--radius-m) var(--radius-m);
		padding: 0.6rem 0.7rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-block-start: -1px;
	}
	.fields-hint {
		margin: 0.2rem 0 0;
	}
	.field-list {
		display: flex;
		flex-direction: column;
	}
	.field-row {
		border-block-start: 1px solid var(--line);
	}
	.field-row:first-child {
		border-block-start: 0;
	}
	.expand-row {
		border-block-start: 0;
		padding-block: 0.15rem;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.9rem;
	}
	.field .with-button {
		display: flex;
		gap: 0.4rem;
	}
	.field .with-button input {
		flex: 1;
		min-inline-size: 0;
	}
	.remove {
		align-self: flex-start;
		background: none;
		border: 0;
		color: var(--text-muted);
		text-decoration: underline;
		cursor: pointer;
		padding: 0;
		font-size: 0.8rem;
	}
	.add-row {
		margin-block-start: 0.8rem;
	}
	/* ネイティブ select はダークモードで option が読めなくなりがちなので配色を明示する。 */
	.add-select {
		inline-size: 100%;
		padding: 0.5rem 0.6rem;
		color: var(--text);
		background: var(--bg-inset);
		border: 1px solid var(--line-strong);
		border-radius: var(--radius-m);
		color-scheme: light dark;
		cursor: pointer;
	}
	.add-select option {
		background: var(--bg);
		color: var(--text);
	}
	.actions {
		margin-block-start: 0.8rem;
	}
	/* 他の設定画面の保存ボタン（.auth-card > button）と同じ全幅プライマリに揃える。 */
	.save {
		inline-size: 100%;
		padding: 13px;
		border-radius: var(--radius-pill);
		font-weight: 700;
	}
	.save:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}
	.ok {
		color: var(--accent);
		font-size: 0.85rem;
	}
	.error-text {
		color: var(--danger, crimson);
		font-size: 0.85rem;
	}
</style>
