import type { PostScope } from '$lib/post/scope';
import type { SharedContent } from './store';

export interface ShareComposerState {
	busy: boolean;
	ready: boolean;
	hasContent: boolean;
	hasTarget: boolean;
	scope: PostScope;
}

export interface ShareComposer {
	getShareState(): ShareComposerState;
	importShared(content: SharedContent, did: string): Promise<string[]>;
}
