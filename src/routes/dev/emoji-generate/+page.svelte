<script lang="ts">
	import EmojiGeneratePanel from '$lib/components/EmojiGeneratePanel.svelte';
	import type { EmojiGenerationView } from '$lib/api/types';

	/**
	 * 「botたんに描いてもらう」タブ（EmojiGeneratePanel）を AppView なしで確かめるページ。
	 * 候補の絵は canvas で描いたモックで、依頼も登録もブラウザ内だけで完結し、どこにも送信しない。
	 */
	const mockImage = (text: string, color: string, width = 128, height = 128) => {
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const context = canvas.getContext('2d')!;
		context.font = `900 ${Math.round(height * 0.62)}px sans-serif`;
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.lineJoin = 'round';
		context.lineWidth = 10;
		context.strokeStyle = '#2b2b33';
		context.strokeText(text, width / 2, height / 2, width - 12);
		context.lineWidth = 5;
		context.strokeStyle = '#ffffff';
		context.strokeText(text, width / 2, height / 2, width - 12);
		context.fillStyle = color;
		context.fillText(text, width / 2, height / 2, width - 12);
		return { image: canvas.toDataURL('image/png'), width, height };
	};

	const now = Date.now();
	const iso = (offsetMinutes: number) => new Date(now + offsetMinutes * 60_000).toISOString();
	const generation = (overrides: Partial<EmojiGenerationView>): EmojiGenerationView => ({
		id: crypto.randomUUID(),
		prompt: '',
		name: 'emoji',
		description: '',
		aspect: 'square',
		state: 'done',
		candidates: [],
		total: 1,
		createdAt: iso(-10),
		expiresAt: iso(24 * 60),
		...overrides,
	});

	let generations = $state<EmojiGenerationView[]>([]);
	$effect(() => {
		// 画面は最新の結果1件と、描いている途中の依頼1件を重ねて見せる。
		// ?state=fresh で初めての依頼（前の絵なし）、?state=failed で描けなかった結果を確かめられる。
		const state = new URL(location.href).searchParams.get('state');
		const latest =
			state === 'failed'
				? generation({ prompt: 'よくわからないもの', state: 'failed', error: 'generation_failed' })
				: generation({
						prompt: 'フレーフレーと応援するbotたん',
						lettering: 'フレーフレー',
						name: 'bot_tan_cheering',
						description: 'フレーフレーと応援するbotたん',
						aspect: 'long',
						candidates: [mockImage('フレーフレー', '#4dd0e1', 128, 43)],
						finishedAt: iso(-5),
					});
		const pending = generation({
			prompt: 'フレーフレーと応援するbotたん',
			state: 'running',
			createdAt: iso(-1),
		});
		generations =
			state === 'fresh' ? [pending] : state === 'done' || state === 'failed' ? [latest] : [pending, latest];
	});

	const api = {
		list: async () => ({ generations }),
		create: async (prompt: string) => {
			const created = generation({ prompt, state: 'queued', queuePosition: 2, createdAt: iso(0) });
			generations = [created, ...generations];
			return { generation: created, estimatedWaitSeconds: 3 * 45 };
		},
		register: async () => ({}) as never,
	};
</script>

<section class="auth-card settings-detail">
	<h1>AIでつくる（モック）</h1>
	{#if generations.length}
		<EmojiGeneratePanel onregistered={() => {}} {api} />
	{/if}
</section>
