import fs from 'node:fs';
import { dirname, resolve } from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import ts from 'typescript';
import { parse } from 'svelte/compiler';

// Read-only verification of historical evidence and current documentation.
if (process.argv.slice(2).some((arg) => !['--check', '--check-current'].includes(arg))) {
	console.error(
		'Read-only verifier. Use --check for history/docs, or --check-current to also verify unchanged application sources.',
	);
	process.exit(1);
}
const root = 'openspec';
const domains = [
	['auth-session', /oauth|optin|\/sso\/|auth-init/],
	['appview-protocol', /\/api\/(?:appview|types|authorization|useTypeahead|push)|\/atproto\//],
	[
		'post-composer',
		/\/post\/|\/drafts\/|Composer|PostModal|PostScope|PostFab|PostFollowNotice|GuestPostModal|ArticleTitle|ContentWarningPicker|content-warning-picker|post-edit|post-assist|post-moderation|composer-/,
	],
	[
		'media-processing',
		/images\.|video|Video|gif-compression|media-selection|\/media\/|Image|AvatarCropper|MediaGrid|SortableImage|BluemojiMedia|LinkCard|compositor/,
	],
	[
		'feed-thread',
		/\/feed\/|\/thread\/|Feed|Thread|InfiniteScroll|NewPosts|ReplyToViewer|BotReplyStatus|PostUnavailable|QuoteFrame|QuoteCard|ChatBubble|RichText|InlineRuns|TranslateToggle|reaction-bar|ReactionBar|ReactionStamp|feed-interactions|reply-to-viewer|bot-reply-collapse/,
	],
	['bluesky-integration', /\/bsky\/|\/crosspost\/|bsky-|crosspost-/],
	['blog-publication', /\/standardsite\/|\/blog\/|Blog|standard-site|blog-/],
	['diary-trilines', /\/diary\/|\/trilines\/|Diary|Mood|MonthlyActivity|Trilines|mood-|trilines/],
	[
		'cards-zenkatsu-advent',
		/\/cards?\/|\/zenkatsu\/|\/advent\/|Card|Zenkatsu|Advent|zenkatsu|card-draw/,
	],
	['radio', /\/radio\/|Radio|radio\.spec/],
	['news-chronicle', /\/news\/|\/chronicle\/|News|Chronicle|chronicle-motion/],
	['notifications-unread', /\/notifications\/|\/unread\/|service-worker/],
	['emoji-tags', /\/emoji\/|\/tag-favorites\/|\/tags\.|\/profile\/tags|Emoji|emoji|Tag|tags\//],
	[
		'preferences-profile',
		/\/preferences\/|\/profile\/|\/private-list\/|\/mute\/|\/bookmarks\/|\/badges\/|\/onboarding\/|\/guest-posts\/|Bookmark|Profile|Actor|Avatar|BusinessCard|DeleteAccount|WelcomeTutorial|PreferencesSync|SignedOut|welcome-tutorial|profile-reaction|reaction-privacy/,
	],
	[
		'moderation-privacy',
		/\/moderation\/|\/legal\/|\/privacy\/|\/terms\/|Moderation|ContentWarningMask|AgeConfirm|AgeAssurance|Report|\/report\.|\/moderation\//,
	],
	['i18n-theme', /\/i18n\/|theme|\/language\//],
	[
		'seo-deployment',
		/^api\/|\/seo\/|\/og\/|\/routing\/|sitemap|robots|vite\.config|vercel|app\.d\.ts/,
	],
	['ui-platform', /./],
];
function domain(p) {
	// More specific ownership wins over shared component name substrings.
	const libArea = p.match(/^src\/lib\/([^/]+)\//)?.[1];
	const areas = {
		'feed-tabs': 'feed-thread',
		radio: 'radio',
		blog: 'blog-publication',
		standardsite: 'blog-publication',
		bsky: 'bluesky-integration',
		crosspost: 'bluesky-integration',
		card: 'cards-zenkatsu-advent',
		cards: 'cards-zenkatsu-advent',
		advent: 'cards-zenkatsu-advent',
		notifications: 'notifications-unread',
		unread: 'notifications-unread',
		chronicle: 'news-chronicle',
		news: 'news-chronicle',
		diary: 'diary-trilines',
		trilines: 'diary-trilines',
		moderation: 'moderation-privacy',
		profile: 'preferences-profile',
	};
	if (areas[libArea]) return areas[libArea];
	if (/^api\//.test(p)) return 'seo-deployment';
	const route = p.match(/^src\/routes\/(?:settings\/|dev\/(?:e2e\/)?)?([^/]+)/)?.[1];
	const routeDomains = {
		login: 'auth-session',
		onboarding: 'preferences-profile',
		oauth: 'auth-session',
		feed: 'feed-thread',
		global: 'feed-thread',
		channels: 'feed-thread',
		thread: 'feed-thread',
		search: 'feed-thread',
		diary: 'diary-trilines',
		trilines: 'diary-trilines',
		chronicle: 'news-chronicle',
		news: 'news-chronicle',
		advent: 'cards-zenkatsu-advent',
		affirmation: 'cards-zenkatsu-advent',
		cards: 'cards-zenkatsu-advent',
		record: 'cards-zenkatsu-advent',
		birthday: 'cards-zenkatsu-advent',
		'name-card': 'preferences-profile',
		radio: 'radio',
		emoji: 'emoji-tags',
		'emoji-favorites': 'emoji-tags',
		tags: 'emoji-tags',
		notifications: 'notifications-unread',
		moderation: 'moderation-privacy',
		report: 'moderation-privacy',
		profile: 'preferences-profile',
		mute: 'preferences-profile',
		'home-list': 'preferences-profile',
		'delete-data': 'preferences-profile',
		'bot-name': 'preferences-profile',
		'bot-reply-freq': 'preferences-profile',
		crosspost: 'bluesky-integration',
		'feed-tabs': 'feed-thread',
		'standard-site': 'blog-publication',
		language: 'i18n-theme',
		appearance: 'i18n-theme',
		privacy: 'moderation-privacy',
		terms: 'moderation-privacy',
	};
	if (routeDomains[route]) return routeDomains[route];
	if (/\/crosspost\/|\/bsky\/|bsky-|crosspost-/.test(p)) return 'bluesky-integration';
	if (/\/guest-posts\//.test(p)) return 'preferences-profile';
	if (/\/layout\/|\/dnd\/|\/actions\//.test(p)) return 'ui-platform';
	return domains.find(([, re]) => re.test(p))[0];
}
function hash(s) {
	return crypto.createHash('sha256').update(s).digest('hex');
}
function tsComments(s, p) {
	const sf = ts.createSourceFile(
		p,
		s,
		ts.ScriptTarget.Latest,
		true,
		p.endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
	);
	const spans = new Map();
	function add(ranges) {
		for (const r of ranges ?? []) spans.set(`${r.pos}:${r.end}`, [r.pos, r.end]);
	}
	function walk(n) {
		add(ts.getLeadingCommentRanges(s, n.pos));
		add(ts.getTrailingCommentRanges(s, n.end));
		for (const c of n.getChildren(sf)) walk(c);
	}
	walk(sf);
	return [...spans.values()];
}
function comments(s, p) {
	let ranges = [];
	if (p.endsWith('.svelte')) {
		const ast = parse(s, { modern: true });
		ranges.push(...ast.comments.map((c) => [c.start, c.end]));
		const visit = (n) => {
			if (!n || typeof n !== 'object') return;
			if (n.type === 'Comment') ranges.push([n.start, n.end]);
			for (const [k, v] of Object.entries(n)) {
				if (['comments', 'loc', 'metadata', 'parent'].includes(k)) continue;
				if (Array.isArray(v)) v.forEach(visit);
				else if (v && typeof v === 'object') visit(v);
			}
		};
		visit(ast.fragment);
		for (const m of s.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)) {
			const offset = m.index + m[0].indexOf('>') + 1;
			for (const c of m[1].matchAll(/\/\*[\s\S]*?\*\//g))
				ranges.push([offset + c.index, offset + c.index + c[0].length]);
		}
	} else if (/\.(?:ts|tsx|js|mjs|cjs|mts|cts|json|jsonc)$/.test(p)) ranges = tsComments(s, p);
	else if (p.endsWith('.css')) {
		const re = /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\/\*[\s\S]*?\*\//g;
		for (const m of s.matchAll(re))
			if (m[0].startsWith('/*')) ranges.push([m.index, m.index + m[0].length]);
	} else if (p.endsWith('.html')) {
		for (const m of s.matchAll(/<!--[\s\S]*?-->/g)) ranges.push([m.index, m.index + m[0].length]);
	} else {
		for (const m of s.matchAll(/^\s*#[^\n]*/gm)) {
			const start = m.index + m[0].indexOf('#');
			ranges.push([start, m.index + m[0].length]);
		}
	}
	ranges = [...new Map(ranges.map((r) => [r.join(':'), r])).values()].sort((a, b) => a[0] - b[0]);
	// Adjacent // lines form one documented decision.
	const merged = [];
	for (const r of ranges) {
		const prev = merged.at(-1);
		if (
			prev &&
			s.slice(prev[0], prev[0] + 2) === '//' &&
			s.slice(r[0], r[0] + 2) === '//' &&
			/^\s*$/.test(s.slice(prev[1], r[0])) &&
			(s.slice(prev[1], r[0]).match(/\n/g) || []).length === 1
		)
			prev[1] = r[1];
		else merged.push([...r]);
	}
	return merged.map(([start, end]) => ({
		line: s.slice(0, start).split('\n').length,
		endLine: s.slice(0, end).split('\n').length,
		text: s.slice(start, end),
	}));
}
const jsonPath = `${root}/comment-catalog.json`;
const old = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const failures = [];
const checkCurrent = process.argv.includes('--check-current');
// Verify the recorded source, not moving line positions on the current branch.
const historicalFiles = old.files.map((entry) => {
	const source = execFileSync('git', ['show', `${old.baseline}:${entry.path}`], {
		encoding: 'utf8',
	});
	return { ...entry, sha256: hash(source), comments: comments(source, entry.path) };
});
if (JSON.stringify(old.files) !== JSON.stringify(historicalFiles))
	failures.push('Recorded hashes/comments do not match the baseline Git sources.');
if (checkCurrent) {
	const candidates = [
		...new Set(
			execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], {
				encoding: 'utf8',
			}).split('\0'),
		),
	].filter(
		(p) =>
			p &&
			!p.startsWith('openspec/') &&
			!p.startsWith('.agents/') &&
			!p.startsWith('docs/') &&
			!/^(?:package-lock\.json|pnpm-lock\.yaml)$/.test(p) &&
			(/\.(?:svelte|ts|tsx|js|mjs|cjs|mts|cts|css|html|json|jsonc|ya?ml)$/.test(p) ||
				['.gitignore', '.prettierignore', '.env.example', '.npmrc'].includes(p)),
	);
	const currentFiles = candidates.sort().map((p) => {
		const source = fs.readFileSync(p, 'utf8');
		return { path: p, sha256: hash(source), domain: domain(p), comments: comments(source, p) };
	});
	const expected = new Map(old.files.map((file) => [file.path, file]));
	if (
		currentFiles.length !== expected.size ||
		currentFiles.some((file) => JSON.stringify(file) !== JSON.stringify(expected.get(file.path)))
	)
		failures.push(
			'Current source file list, content or comments differ from the recorded baseline.',
		);
}
const historicalDomains = new Set(old.files.filter((f) => f.comments.length).map((f) => f.domain));
const specDomains = fs
	.readdirSync(`${root}/specs`)
	.filter((domain) => fs.existsSync(`${root}/specs/${domain}/spec.md`));
for (const d of specDomains) {
	const spec = fs.readFileSync(`${root}/specs/${d}/spec.md`, 'utf8');
	const design = fs.readFileSync(`${root}/specs/${d}/design.md`, 'utf8');
	for (const section of [
		'## Purpose',
		'### 機能概要',
		'### 機能一覧',
		'### 主な利用の流れ',
		'## Requirements',
		'### Requirement:',
		'#### Scenario:',
		'## 参照資料',
		'### 外部資料',
		'### 関連する内部資料',
	])
		if (!spec.includes(section)) failures.push(`Missing reader section ${section}: ${d}`);
	for (const section of [
		'## 設計判断',
		'**課題**',
		'**採用判断**',
		'**理由と制約**',
		'## 実装の入口',
		'## 出典と変更時の扱い',
	])
		if (!design.includes(section)) failures.push(`Missing design section ${section}: ${d}`);
	if (/#L\d+/.test(design)) failures.push(`Living design contains line-specific code links: ${d}`);
	for (const match of spec.matchAll(/\]\(#([a-z]+-\d+)\)/g))
		if (!spec.includes(`<a id="${match[1]}"></a>`))
			failures.push(`Feature link lacks requirement anchor: ${d}/${match[1]}`);
	for (const match of spec.matchAll(/### Requirement: ([A-Z]+-\d+)/g))
		if (!spec.includes(`](#${match[1].toLowerCase()})`))
			failures.push(`Requirement missing from feature inventory: ${d}/${match[1]}`);
}
// Historical source groups can remain fixed when the living specification is reorganized.
for (const d of historicalDomains) {
	const snapshot = fs.readFileSync(`${root}/reference/comment-snapshot/${d}.md`, 'utf8');
	for (const f of old.files.filter((f) => f.domain === d))
		for (const c of f.comments) {
			const id = `${f.path}:${c.line}`;
			const permalink = `https://github.com/suibari/nagi_client/blob/${old.baseline}/${f.path}#L${c.line}`;
			if (!snapshot.includes(`<!-- source: ${id} -->`) || !snapshot.includes(c.text))
				failures.push(`Missing evidence: ${id}`);
			if (!snapshot.includes(`](${permalink})`))
				failures.push(`Missing immutable source link: ${id}`);
		}
}
function markdownFiles(directory) {
	return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const target = `${directory}/${entry.name}`;
		return entry.isDirectory() ? markdownFiles(target) : entry.name.endsWith('.md') ? [target] : [];
	});
}
let linkCount = 0;
for (const file of ['README.md', 'AGENTS.md', 'CLAUDE.md', ...markdownFiles(root)]) {
	let fence;
	const prose = fs
		.readFileSync(file, 'utf8')
		.split('\n')
		.filter((line) => {
			const opening = line.match(/^\s*(`{3,}|~{3,})/);
			if (opening) {
				if (!fence) fence = opening[1];
				else if (opening[1][0] === fence[0] && opening[1].length >= fence.length) fence = undefined;
				return false;
			}
			return !fence;
		})
		.join('\n');
	for (const match of prose.matchAll(/\]\(([^)\n]+)\)/g)) {
		const destination = match[1].replace(/^<|>$/g, '');
		if (/^(?:https?:|mailto:|#)/.test(destination)) continue;
		const target = resolve(dirname(file), destination.split('#')[0]);
		if (!fs.existsSync(target)) failures.push(`Missing local link: ${file} -> ${destination}`);
		linkCount++;
	}
}
if (!fs.readFileSync('CLAUDE.md', 'utf8').includes('@AGENTS.md'))
	failures.push('Claude entry must import shared AGENTS.md.');
if (failures.length) {
	console.error(failures.join('\n'));
	process.exitCode = 1;
} else {
	console.log(
		`PASS: ${specDomains.length} reader-oriented specs and designs; ${old.files.length} baseline files; ${old.files.reduce((n, f) => n + f.comments.length, 0)} preserved comment blocks with immutable links; ${linkCount} local links.`,
	);
	if (checkCurrent)
		console.log(
			'PASS: current source/config files and comments are unchanged from the recorded baseline.',
		);
}
