import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import ContentWarningPicker from './ContentWarningPicker.svelte';

const base = {
	open: true,
	// SSR では位置計算もポータルも走らないので、要素の代わりで足りる。
	anchor: {} as HTMLElement,
	hasSelection: false,
	ontextwarning: () => {},
};

/** 「画像・動画をぼかす」項目のボタン（開始タグ）と、その中身。 */
function mediaItem(body: string) {
	const match =
		/<button[^>]*role="menuitemcheckbox"[^>]*>(?:(?!<\/button>)[\s\S])*画像・動画をぼかす[\s\S]*?<\/button>/.exec(
			body,
		);
	expect(match).not.toBeNull();
	return match![0];
}

describe('content warning menu', () => {
	it('offers media blurring as one switch alongside the text blur and labels', () => {
		const { body } = render(ContentWarningPicker, {
			props: { ...base, mediaWarningEnabled: true, hasMedia: true, mediaWarning: true },
		});
		const item = mediaItem(body);
		expect(item).toContain('aria-checked="true"');
		expect(item).not.toMatch(/<button[^>]*disabled/);
		expect(body).toContain('選択したテキストをぼかす');
		expect(body).toContain('AI生成');
	});

	it('cannot be turned on without media', () => {
		const { body } = render(ContentWarningPicker, {
			props: { ...base, mediaWarningEnabled: true, hasMedia: false },
		});
		const item = mediaItem(body);
		expect(item).toMatch(/<button[^>]*disabled/);
		expect(item).toContain('画像・動画を添付すると選べます');
	});

	it('lets the media blur and an adult label be chosen together', () => {
		const { body } = render(ContentWarningPicker, {
			props: {
				...base,
				mediaWarningEnabled: true,
				hasMedia: true,
				mediaWarning: true,
				selectedLabels: ['sexual'],
			},
		});
		const item = mediaItem(body);
		expect(item).toContain('aria-checked="true"');
		expect(item).not.toMatch(/<button[^>]*disabled/);
		expect(body).toMatch(/aria-checked="true"[^>]*>(?:(?!<\/button>)[\s\S])*性的/);
	});

	it('leaves labels out where they cannot be set', () => {
		const { body } = render(ContentWarningPicker, {
			props: { ...base, mediaWarningEnabled: true, hasMedia: true, labelsEnabled: false },
		});
		expect(body).toContain('画像・動画をぼかす');
		expect(body).not.toContain('AI生成');
	});
});
