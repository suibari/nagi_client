<script lang="ts">
	import { onMount } from 'svelte';
	import { m } from '$lib/i18n/i18n.svelte';
	import { session } from '$lib/oauth/session.svelte';
	import ToggleSwitch from '$lib/components/ToggleSwitch.svelte';
	import {
		getOwnAppLinks,
		putAppLinks,
		listOwnCollections,
		fetchOwnLatestRecord,
		flattenRecord,
		resolveSchemaFields,
		resolveAppIcon,
		suggestAppUri,
		type AppLink,
		type AppLinkFieldRole,
	} from '$lib/atproto/appLinks';

	type Role = '' | AppLinkFieldRole;
	type FieldRow = { path: string; sample?: string; schema: boolean; role: Role; label: string };
	type LinkEditor = {
		collection: string;
		label: string;
		appUri: string;
		iconUrl: string;
		enabled: boolean;
		rows: FieldRow[];
		expanded: boolean;
		loading: boolean;
		sampleError: boolean;
		schemaResolved: boolean;
		iconBusy: boolean;
		iconError: boolean;
	};

	const roleOptions: { value: Role; label: () => string }[] = [
		{ value: '', label: m.appLinksRoleNone },
		{ value: 'title', label: m.appLinksRoleTitle },
		{ value: 'value', label: m.appLinksRoleValue },
		{ value: 'datetime', label: m.appLinksRoleDatetime },
		{ value: 'url', label: m.appLinksRoleUrl },
	];

	let editors = $state<LinkEditor[]>([]);
	let discovered = $state<string[]>([]);
	let loaded = $state(false);
	let saving = $state(false);
	let saveState = $state<'idle' | 'saved' | 'failed'>('idle');

	function toEditor(link: AppLink): LinkEditor {
		return {
			collection: link.collection,
			label: link.label ?? '',
			appUri: link.appUri ?? '',
			iconUrl: link.iconUrl ?? '',
			enabled: link.enabled !== false,
			rows: (link.fields ?? []).map((f) => ({
				path: f.path,
				schema: false,
				role: f.role,
				label: f.label ?? '',
			})),
			expanded: false,
			loading: false,
			sampleError: false,
			schemaResolved: false,
			iconBusy: false,
			iconError: false,
		};
	}

	onMount(async () => {
		if (!$session) {
			loaded = true;
			return;
		}
		try {
			const [links, cols] = await Promise.all([getOwnAppLinks(), listOwnCollections().catch(() => [])]);
			editors = links.map(toEditor);
			discovered = cols;
		} finally {
			loaded = true;
		}
	});

	function addLink() {
		editors.push({
			collection: '',
			label: '',
			appUri: '',
			iconUrl: '',
			enabled: true,
			rows: [],
			expanded: true,
			loading: false,
			sampleError: false,
			schemaResolved: false,
			iconBusy: false,
			iconError: false,
		});
	}

	function removeLink(index: number) {
		editors.splice(index, 1);
	}

	async function loadSample(editor: LinkEditor) {
		const collection = editor.collection.trim();
		if (!collection) return;
		editor.loading = true;
		editor.sampleError = false;
		editor.schemaResolved = false;
		if (!editor.appUri) editor.appUri = suggestAppUri(collection) ?? '';
		try {
			const [record, schemaFields] = await Promise.all([
				fetchOwnLatestRecord(collection),
				resolveSchemaFields(collection),
			]);
			editor.schemaResolved = schemaFields.length > 0;
			const flat = record ? flattenRecord(record) : [];
			editor.sampleError = !record;
			// 既存 rows の role/label を保持しつつ、サンプル＆スキーマのパスを統合する。
			const existing = new Map(editor.rows.map((r) => [r.path, r]));
			const merged = new Map<string, FieldRow>();
			for (const f of flat) {
				const prev = existing.get(f.path);
				merged.set(f.path, {
					path: f.path,
					sample: f.sample,
					schema: false,
					role: prev?.role ?? '',
					label: prev?.label ?? '',
				});
			}
			for (const s of schemaFields) {
				const row = merged.get(s.path);
				if (row) row.schema = true;
				else {
					const prev = existing.get(s.path);
					merged.set(s.path, {
						path: s.path,
						schema: true,
						role: prev?.role ?? '',
						label: prev?.label ?? '',
					});
				}
			}
			// サンプルにもスキーマにも無いが既に設定済みのパスは残す。
			for (const [path, row] of existing) if (!merged.has(path)) merged.set(path, row);
			editor.rows = [...merged.values()];
			editor.expanded = true;
		} finally {
			editor.loading = false;
		}
	}

	async function fetchIcon(editor: LinkEditor) {
		const uri = editor.appUri.trim();
		if (!uri) return;
		editor.iconBusy = true;
		editor.iconError = false;
		try {
			const icon = await resolveAppIcon(uri);
			if (icon) editor.iconUrl = icon;
			else editor.iconError = true;
		} finally {
			editor.iconBusy = false;
		}
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
					...(e.appUri.trim() ? { appUri: e.appUri.trim() } : {}),
					...(e.iconUrl.trim() ? { iconUrl: e.iconUrl.trim() } : {}),
					enabled: e.enabled,
					fields: e.rows
						.filter((r) => r.role)
						.map((r) => ({
							path: r.path,
							role: r.role as AppLinkFieldRole,
							...(r.label.trim() ? { label: r.label.trim() } : {}),
						})),
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
			{#if discovered.length}
				<p class="muted discovered">
					{m.appLinksDiscoveredHint()}
					{#each discovered as c (c)}<code>{c}</code>{/each}
				</p>
			{/if}

			{#each editors as editor, i (i)}
				<div class="link-card">
					<div class="link-head">
						{#if editor.iconUrl}
							<img class="link-icon" src={editor.iconUrl} alt="" width="20" height="20" />
						{/if}
						<input
							class="collection"
							type="text"
							list="app-links-collections"
							placeholder={m.appLinksCollectionPlaceholder()}
							aria-label={m.appLinksCollectionLabel()}
							bind:value={editor.collection}
						/>
						<button type="button" disabled={editor.loading || !editor.collection.trim()} onclick={() => loadSample(editor)}>
							{editor.loading ? m.appLinksLoadingSample() : m.appLinksLoadSample()}
						</button>
						<button type="button" class="remove" onclick={() => removeLink(i)} aria-label={m.appLinksRemove()} title={m.appLinksRemove()}>×</button>
					</div>

					{#if editor.expanded}
						<label class="field">
							<span>{m.appLinksLabelLabel()}</span>
							<input type="text" bind:value={editor.label} />
						</label>

						<label class="field">
							<span>{m.appLinksAppUriLabel()}</span>
							<span class="with-button">
								<input type="url" placeholder="https://" bind:value={editor.appUri} />
								<button type="button" disabled={editor.iconBusy || !editor.appUri.trim()} onclick={() => fetchIcon(editor)}>
									{editor.iconBusy ? m.appLinksResolvingIcon() : m.appLinksResolveIcon()}
								</button>
							</span>
						</label>
						{#if editor.iconError}<p class="muted">{m.appLinksIconFailed()}</p>{/if}

						<ToggleSwitch checked={editor.enabled} label={m.appLinksEnabledLabel()} onchange={(v) => (editor.enabled = v)} />

						{#if editor.sampleError}
							<p class="muted">{m.appLinksNoSample()}</p>
						{/if}

						{#if editor.rows.length}
							<fieldset class="fields">
								<legend>
									{m.appLinksFieldsLegend()}
									{#if editor.schemaResolved}<span class="badge">{m.appLinksSchemaResolved()}</span>{/if}
								</legend>
								{#each editor.rows as row (row.path)}
									<div class="field-row">
										<div class="path-col">
											<code>{row.path}</code>
											{#if row.sample !== undefined}<small class="sample">{m.appLinksSampleLabel()}: {row.sample}</small>{/if}
										</div>
										<select bind:value={row.role} aria-label={row.path}>
											{#each roleOptions as opt (opt.value)}<option value={opt.value}>{opt.label()}</option>{/each}
										</select>
										<input
											class="row-label"
											type="text"
											placeholder={m.appLinksFieldLabelPlaceholder()}
											bind:value={row.label}
											disabled={!row.role}
										/>
									</div>
								{/each}
							</fieldset>
						{/if}
					{/if}
				</div>
			{/each}

			<datalist id="app-links-collections">
				{#each discovered as c (c)}<option value={c}></option>{/each}
			</datalist>

			<div class="actions">
				<button type="button" class="ghost" onclick={addLink}>+ {m.appLinksAddLink()}</button>
				<button type="button" disabled={saving} onclick={save}>{saving ? m.appLinksSaving() : m.appLinksSave()}</button>
			</div>
			{#if editors.length === 0}<p class="muted">{m.appLinksEmpty()}</p>{/if}
			{#if saveState === 'saved'}<p class="ok">{m.appLinksSaved()}</p>{/if}
			{#if saveState === 'failed'}<p class="error-text">{m.appLinksSaveFailed()}</p>{/if}
		{/if}
	</fieldset>
</section>

<style>
	.muted {
		color: var(--text-muted);
		font-size: 0.85rem;
	}
	.discovered {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
		align-items: center;
	}
	.discovered code,
	.path-col code {
		background: var(--bg-inset);
		border-radius: var(--radius-s);
		padding: 0.05rem 0.35rem;
		font-size: 0.8rem;
		word-break: break-all;
	}
	.link-card {
		border: 1px solid var(--line);
		border-radius: var(--radius-m);
		padding: 0.75rem;
		margin-block: 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}
	.link-head {
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}
	.link-icon {
		border-radius: var(--radius-s);
		flex: none;
	}
	.link-head .collection {
		flex: 1;
		min-inline-size: 0;
	}
	.remove {
		flex: none;
		background: none;
		border: 0;
		color: var(--text-muted);
		font-size: 1.2rem;
		cursor: pointer;
		line-height: 1;
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
	.fields {
		border: 1px solid var(--line);
		border-radius: var(--radius-s);
		padding: 0.5rem;
	}
	.fields .badge {
		margin-inline-start: 0.4rem;
		font-size: 0.7rem;
		color: var(--accent);
	}
	.field-row {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		gap: 0.4rem;
		align-items: center;
		padding-block: 0.3rem;
		border-block-start: 1px solid var(--line);
	}
	.field-row:first-of-type {
		border-block-start: 0;
	}
	.path-col {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		min-inline-size: 0;
	}
	.path-col .sample {
		color: var(--text-muted);
		font-size: 0.72rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.row-label {
		min-inline-size: 0;
	}
	.actions {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
		margin-block-start: 0.75rem;
	}
	.actions .ghost {
		background: none;
		border: 1px dashed var(--line-strong);
		color: var(--text);
	}
	.ok {
		color: var(--accent);
		font-size: 0.85rem;
	}
	.error-text {
		color: var(--danger, crimson);
		font-size: 0.85rem;
	}
	@media (max-width: 480px) {
		.field-row {
			grid-template-columns: 1fr 1fr;
		}
		.path-col {
			grid-column: 1 / -1;
		}
	}
</style>
