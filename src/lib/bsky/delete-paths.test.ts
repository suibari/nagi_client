import { describe, expect, it } from 'vitest';

const raw = import.meta.glob<string>(['/src/**/*.ts', '/src/**/*.svelte', '!/src/**/*.test.ts'], {
	query: '?raw',
	import: 'default',
	eager: true,
});
const files = Object.entries(raw).map(([path, text]) => ({
	path: path.slice('/src/'.length),
	text,
}));
const callers = (pattern: RegExp) =>
	files
		.filter((file) => pattern.test(file.text))
		.map((file) => file.path)
		.sort();

// Bluesky 投稿の削除は、利用者が確認した操作からだけ行う（BSKY-06・BSKY-10）。
describe('Bluesky post deletion paths', () => {
	it('never deletes copies to roll back a failed crosspost', () => {
		const crosspost = files.filter((file) => file.path.startsWith('lib/crosspost/'));
		expect(crosspost.length).toBeGreaterThan(0);
		for (const file of crosspost)
			expect(file.text, file.path).not.toMatch(/deleteRecord|deletePost\(|deleteOwnBskyPost/);
	});

	it('deletes a Bluesky post only from the post menu and the Nagi delete dialog', () => {
		expect(callers(/deleteOwnBskyPost\(/)).toEqual([
			'lib/bsky/agent.ts',
			'lib/components/bsky/BskyPostCard.svelte',
		]);
		expect(callers(/deleteCrosspostCopies\(/)).toEqual([
			'lib/bsky/agent.ts',
			'lib/components/ChatBubble.svelte',
		]);
	});
});
