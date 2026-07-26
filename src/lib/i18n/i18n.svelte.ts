import { ja, type Messages } from './ja';
import { en } from './en';

export type LocalePreference = 'system' | 'ja' | 'en';
export type Locale = 'ja' | 'en';

export const LOCALE_STORAGE_KEY = 'nagi-locale';

const catalogs: Record<Locale, Messages> = { ja, en };

export function isLocalePreference(value: unknown): value is LocalePreference {
	return value === 'system' || value === 'ja' || value === 'en';
}

function detectLocale(): Locale {
	// 公開ページのプリレンダリングは、日本語を正規の初期言語として出力する。
	// Node.js にも navigator があるため、ブラウザ判定には window を使う。
	if (typeof window === 'undefined') return 'ja';
	return navigator.language?.toLowerCase().startsWith('ja') ? 'ja' : 'en';
}

function getStoredPreference(): LocalePreference {
	if (typeof window === 'undefined') return 'system';

	try {
		const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
		return isLocalePreference(stored) ? stored : 'system';
	} catch {
		return 'system';
	}
}

// プリレンダリングした日本語HTMLと初回 hydration を一致させ、マウント直後に端末設定へ切り替える。
const prefs = $state({ preference: 'system' as LocalePreference, browserReady: false });

export const i18n = {
	get preference(): LocalePreference {
		return prefs.preference;
	},
	get locale(): Locale {
		return prefs.browserReady && prefs.preference === 'system'
			? detectLocale()
			: prefs.preference === 'system'
				? 'ja'
				: prefs.preference;
	},
};

function applyLang(): void {
	if (typeof document === 'undefined') return;
	document.documentElement.lang = i18n.locale;
}

export function initLocale(): void {
	if (prefs.browserReady || typeof window === 'undefined') return;
	prefs.preference = getStoredPreference();
	prefs.browserReady = true;
	applyLang();
}

export function setLocalePreference(preference: LocalePreference): void {
	prefs.preference = preference;
	prefs.browserReady = true;
	if (typeof window !== 'undefined') {
		try {
			window.localStorage.setItem(LOCALE_STORAGE_KEY, preference);
		} catch {
			// The language still applies in-memory when storage is unavailable.
		}
	}
	applyLang();
}

export function clearLocalePreference(): void {
	prefs.preference = 'system';
	prefs.browserReady = true;
	if (typeof window !== 'undefined') window.localStorage.removeItem(LOCALE_STORAGE_KEY);
	applyLang();
}

applyLang();

/** Locale string for Intl/toLocaleString calls. */
export function dateLocale(): 'ja-JP' | 'en-US' {
	return i18n.locale === 'ja' ? 'ja-JP' : 'en-US';
}

/** "11秒前" / "3 hours ago" のような相対時刻。チャンネルの更新日時などに使う。 */
export function relativeTime(iso: string): string {
	const then = new Date(iso).getTime();
	if (Number.isNaN(then)) return '';
	const diffSec = Math.round((then - Date.now()) / 1000);
	const abs = Math.abs(diffSec);
	const rtf = new Intl.RelativeTimeFormat(dateLocale(), { numeric: 'auto' });
	const units: [Intl.RelativeTimeFormatUnit, number][] = [
		['year', 31_536_000],
		['month', 2_592_000],
		['week', 604_800],
		['day', 86_400],
		['hour', 3_600],
		['minute', 60],
		['second', 1],
	];
	for (const [unit, secs] of units) {
		if (abs >= secs || unit === 'second') return rtf.format(Math.trunc(diffSec / secs), unit);
	}
	return '';
}

type MessageAccessors = {
	[K in keyof Messages]: Messages[K] extends (...args: infer A) => string
		? (...args: A) => string
		: () => string;
};

/**
 * Reactive message accessors: call as m.key() / m.key(args). Each call reads
 * the current locale from $state, so calls made during render re-run when the
 * language changes. Strings copied into state (e.g. error messages captured in
 * a catch block) keep the language they were created in.
 */
export const m = Object.fromEntries(
	(Object.keys(ja) as (keyof Messages)[]).map((key) => [
		key,
		(...args: unknown[]) => {
			const value = catalogs[i18n.locale][key];
			return typeof value === 'function' ? (value as (...a: unknown[]) => string)(...args) : value;
		},
	]),
) as MessageAccessors;

const keyOfDate = (date: Date) =>
	`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

/** ローカル時刻の日付キー。空文字や不正な ISO は undefined（掲載終了ニュースのプレースホルダ対策）。 */
export function dayKey(iso?: string): string | undefined {
	if (!iso) return undefined;
	const date = new Date(iso);
	return Number.isNaN(date.getTime()) ? undefined : keyOfDate(date);
}

/** 「今日 / 昨日 / 7月23日(水)」の日付見出し。年が違うときだけ年を足す。 */
export function dayHeading(iso: string): string {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return '';
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(today.getDate() - 1);
	const key = keyOfDate(date);
	if (key === keyOfDate(today)) return m.dateToday();
	if (key === keyOfDate(yesterday)) return m.dateYesterday();
	const locale = dateLocale();
	const sameYear = date.getFullYear() === today.getFullYear();
	return m.dateWithWeekday({
		date: date.toLocaleDateString(
			locale,
			sameYear
				? { month: 'short', day: 'numeric' }
				: { year: 'numeric', month: 'short', day: 'numeric' },
		),
		weekday: date.toLocaleDateString(locale, { weekday: 'short' }),
	});
}
