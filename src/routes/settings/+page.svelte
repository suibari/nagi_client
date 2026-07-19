<script lang="ts">
	import {
		getBlueskyProfileDraft,
		getOwnNagiProfile,
		putProfile,
		type ProfileDraft,
		uploadAvatar,
	} from '$lib/atproto/records';
	import AvatarCropper from '$lib/components/AvatarCropper.svelte';
	import { APPVIEW_URL, getProfile } from '$lib/api/appview';
	import { session, oauthReady } from '$lib/oauth/session.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getThemePreference, setThemePreference, type ThemePreference } from '$lib/theme';
	import { onDestroy, onMount } from 'svelte';
	let name = $state('');
	let description = $state('');
	let status = $state('');
	let error = $state('');
	let busy = $state(false);
	let loaded = $state(false);
	let draft = $state<ProfileDraft>();
	let avatarPreview = $state<string>();
	let avatarChange = $state<Blob | null>();
	let cropFile = $state<File>();
	let theme = $state<ThemePreference>('system');
	let onboarding = $derived(page.url.searchParams.get('onboarding') === '1');
	onMount(() => {
		theme = getThemePreference();
	});
	onDestroy(() => {
		if (avatarPreview?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
	});
	function changeTheme(preference: ThemePreference) {
		theme = preference;
		setThemePreference(preference);
	}
	// Use the Nagi profile when editing. On first login, start with the Bluesky profile.
	$effect(() => {
		const did = $session?.did;
		if (!did || loaded) return;
		getOwnNagiProfile()
			.then(async (profile) => {
				if (!profile) return getBlueskyProfileDraft();
				try {
					const currentProfile = await getProfile(did, { limit: 1 });
					const avatar = currentProfile.profile.avatar;
					profile.avatarUrl = avatar?.startsWith('/') ? APPVIEW_URL + avatar : avatar;
				} catch {
					// The PDS record remains the source of truth if AppView has not indexed it yet.
				}
				return profile;
			})
			.then((profile) => {
				if (loaded) return;
				draft = profile;
				avatarPreview = profile.avatarUrl;
				name = profile.displayName;
				description = profile.description;
				loaded = true;
			})
			.catch((e) => {
				error = e instanceof Error ? e.message : 'プロフィールを読み込めませんでした';
				loaded = true;
			});
	});
	function selectAvatar(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;
		if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
			error = 'JPEG、PNG、WebPの画像を選択してください';
			return;
		}
		if (file.size > 25_000_000) {
			error = '25MB以下の画像を選択してください';
			return;
		}
		error = '';
		cropFile = file;
	}
	function applyAvatar(blob: Blob) {
		if (avatarPreview?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
		avatarChange = blob;
		avatarPreview = URL.createObjectURL(blob);
		cropFile = undefined;
	}
	function removeAvatar() {
		if (avatarPreview?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
		avatarChange = null;
		avatarPreview = undefined;
	}
	async function save() {
		if (!$session) {
			location.href = '/login';
			return;
		}
		busy = true;
		status = '';
		error = '';
		try {
			const avatar =
				avatarChange instanceof Blob ? await uploadAvatar(avatarChange) : draft?.avatar;
			const updatedDraft = {
				...draft,
				displayName: name,
				description,
				avatar: avatarChange === null ? undefined : avatar,
			};
			await putProfile(name, description, updatedDraft);
			draft = updatedDraft;
			avatarChange = undefined;
			status = '保存しました';
			if (onboarding) await goto('/');
		} catch (e) {
			error = e instanceof Error ? e.message : '保存できませんでした';
		} finally {
			busy = false;
		}
	}
</script>

<section class="auth-card">
	<h1>設定</h1>
	<fieldset class="theme-settings">
		<legend>表示テーマ</legend>
		<p>この端末で使用する配色を選択します。</p>
		<div class="theme-options">
			{#each [{ value: 'system', label: 'システム設定' }, { value: 'light', label: 'ライト' }, { value: 'dark', label: 'ダーク' }] as option}
				<label class:checked={theme === option.value}>
					<input
						type="radio"
						name="theme"
						value={option.value}
						checked={theme === option.value}
						onchange={() => changeTheme(option.value as ThemePreference)}
					/>
					<span>{option.label}</span>
				</label>
			{/each}
		</div>
	</fieldset>
	<h2>プロフィール設定</h2>
	<p>
		NagiのプロフィールはBlueskyのプロフィールとは独立しています。ここで変更・保存しても、Bluesky側のプロフィールには反映されません。
	</p>
	{#if onboarding}<p>
			Blueskyのプロフィールを初期値として読み込みました。内容を確認して保存してください。
		</p>{/if}
	{#if !$session && $oauthReady}
		<p>設定を変更するにはログインしてください。</p>
		<a class="login" href="/login">ログイン</a>
	{:else}
		<div class="avatar-setting">
			{#if avatarPreview}
				<img class="avatar-preview" src={avatarPreview} alt="現在のアバター" />
			{:else}
				<span class="avatar large">{name.slice(0, 1) || '○'}</span>
			{/if}
			<div class="avatar-controls">
				<label class="avatar-select">
					画像を選択
					<input type="file" accept="image/jpeg,image/png,image/webp" onchange={selectAvatar} />
				</label>
				{#if avatarPreview}
					<button type="button" class="ghost avatar-remove" onclick={removeAvatar}>削除</button>
				{/if}
				<small>JPEG・PNG・WebP。選択後に正方形へトリミングします。</small>
			</div>
		</div>
		<label>表示名<input bind:value={name} maxlength="640" /></label>
		<label>自己紹介<textarea bind:value={description} maxlength="2560" rows="4"></textarea></label>
		<button disabled={busy || !loaded} onclick={save}>{busy ? '保存中…' : '保存'}</button>
		{#if status}<p>{status}</p>{/if}
		{#if error}<p class="error">{error}</p>{/if}
	{/if}
	<div class="legal-links">
		<a href="/terms">利用規約</a><a href="/privacy">プライバシーポリシー</a>
	</div>
</section>

{#if cropFile}
	<AvatarCropper file={cropFile} onconfirm={applyAvatar} oncancel={() => (cropFile = undefined)} />
{/if}
