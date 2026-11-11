import fs from 'node:fs';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import ts from 'typescript';
import { parse } from 'svelte/compiler';

// Documentation tooling only; run from the repository root.
const check = !process.argv.includes('--write');
if (!check && fs.existsSync('openspec/comment-catalog.json')) {
	console.error(
		'Existing provenance must not be overwritten. Preserve removed comments and curate later migrations explicitly.',
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
const candidates = execFileSync(
	'git',
	['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
	{ encoding: 'utf8' },
)
	.split('\0')
	.filter(
		(p) =>
			p &&
			!p.startsWith('openspec/') &&
			!p.startsWith('.agents/') &&
			!p.startsWith('docs/') &&
			!/^(?:package-lock\.json|pnpm-lock\.yaml)$/.test(p) &&
			(/\.(?:svelte|ts|tsx|js|mjs|cjs|mts|cts|css|html|json|jsonc|ya?ml)$/.test(p) ||
				['.gitignore', '.prettierignore', '.env.example', '.npmrc'].includes(p)),
	);
const files = candidates.map((p) => {
	const s = fs.readFileSync(p, 'utf8');
	return { path: p, sha256: hash(s), domain: domain(p), comments: comments(s, p) };
});
const data = {
	schemaVersion: 1,
	baseline: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
	files,
};
const jsonPath = `${root}/comment-catalog.json`;
if (check) {
	const old = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
	const failures = [];
	if (JSON.stringify(old.files) !== JSON.stringify(data.files))
		failures.push(
			'Source file list, content or extracted comments differ from the recorded baseline.',
		);
	for (const d of new Set(files.filter((f) => f.comments.length).map((f) => f.domain))) {
		const spec = fs.readFileSync(`${root}/specs/${d}/spec.md`, 'utf8');
		const design = fs.readFileSync(`${root}/specs/${d}/design.md`, 'utf8');
		if (!spec.includes('### Requirement:') || !spec.includes('#### Scenario:'))
			failures.push(`Missing requirements/scenarios: ${d}`);
		for (const f of files.filter((f) => f.domain === d))
			for (const c of f.comments) {
				const id = `${f.path}:${c.line}`;
				if (!design.includes(`<!-- source: ${id} -->`) || !design.includes(c.text))
					failures.push(`Missing evidence: ${id}`);
			}
	}
	if (failures.length) {
		console.error(failures.join('\n'));
		process.exitCode = 1;
	} else
		console.log(
			`PASS: ${files.length} source/config files; ${files.filter((f) => f.comments.length).length} files with comments; ${files.reduce((n, f) => n + f.comments.length, 0)} comment blocks; all source hashes and domain evidence match.`,
		);
} else {
	fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + '\n');
	for (const d of new Set(files.map((f) => f.domain))) {
		const dir = `${root}/specs/${d}`;
		fs.mkdirSync(dir, { recursive: true });
		const out = [
			`# ${d}：設計判断・コメント出典\n`,
			'この文書は初期仕様化時点のコメント原文を保存する設計資料である。現在の振る舞い・検証条件は [spec.md](spec.md) を参照する。実装理由、互換性条件、UIの意図、型の意味、テストの狙いを省略せず残す。単なる区切り・ツール指示・テンプレートのコメントは動作要件として扱わない。原文に過去の経緯が書かれていない箇所について、経緯を推測して補わない。\n',
		];
		for (const f of files.filter((f) => f.domain === d && f.comments.length)) {
			out.push(`## ${f.path}\n`);
			for (const c of f.comments) {
				const id = `${f.path}:${c.line}`;
				const category = /(?:\.test\.ts|\.spec\.ts|\/dev\/)/.test(f.path)
					? '検証・再現条件'
					: /svelte-ignore|@vite-ignore|@ts-|eslint|prettier|reference lib/.test(c.text)
						? 'ツール指示（削除対象外）'
						: '仕様・設計の根拠';
				const fence = '`'.repeat(
					Math.max(3, ...[...c.text.matchAll(/`+/g)].map((m) => m[0].length + 1)),
				);
				out.push(
					`<!-- source: ${id} -->\n\n### [${id}](../../../${f.path}#L${c.line})\n\n分類: ${category}。対応仕様: [${d}](spec.md#requirements)。\n\n${fence}text\n${c.text}\n${fence}\n`,
				);
			}
		}
		fs.writeFileSync(`${dir}/design.md`, out.join('\n'));
	}
	console.log(
		JSON.stringify(
			{
				files: files.length,
				commentFiles: files.filter((f) => f.comments.length).length,
				blocks: files.reduce((n, f) => n + f.comments.length, 0),
				domains: Object.fromEntries(
					domains.map(([d]) => [
						d,
						files.filter((f) => f.domain === d).reduce((n, f) => n + f.comments.length, 0),
					]),
				),
			},
			null,
			2,
		),
	);
}
