<script lang="ts">
	import BirthdayBalloons from '$lib/components/BirthdayBalloons.svelte';
</script>

<BirthdayBalloons />

<section class="birthday-preview">
	<p class="dev-label">Development preview</p>
	<header class="profile-demo card">
		<div class="avatar" aria-hidden="true">🎂</div>
		<div>
			<h1>お誕生日のユーザー</h1>
			<p>@birthday.example.com</p>
		</div>
	</header>
	<div class="preview-copy card">
		<h2>プロフィール画面・誕生日風船</h2>
		<p>
			ウィンドウ幅を変えて、スマートフォンとデスクトップの密度・大きさを確認できます。再読み込みすると演出が最初から表示されます。
		</p>
	</div>
</section>

<style>
	.birthday-preview {
		display: grid;
		gap: 1rem;
		padding-block: 1rem 5rem;
	}
	.dev-label {
		margin: 0;
		color: var(--text-muted);
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}
	.profile-demo {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: clamp(1rem, 4vw, 2rem);
	}
	.avatar {
		display: grid;
		place-items: center;
		inline-size: clamp(72px, 18vw, 112px);
		aspect-ratio: 1;
		border-radius: 50%;
		background: color-mix(in srgb, var(--accent) 20%, var(--surface));
		font-size: clamp(2rem, 8vw, 4rem);
	}
	h1,
	h2,
	p {
		margin-block: 0;
	}
	.profile-demo p,
	.preview-copy p {
		color: var(--text-muted);
	}
	.preview-copy {
		display: grid;
		gap: 0.6rem;
		padding: 1rem;
	}
</style>
