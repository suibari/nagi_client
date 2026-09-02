import { ApiRequestError, getPreferences, putPreferences } from '$lib/api/appview';

/**
 * 年齢確認の状態。
 *
 * 生年月日は入力しなくても利用を始められる（その場合は未成年として扱う）。
 * あとから1度だけ設定でき、以後は変更できない。成人向けコンテンツを見るために
 * 年齢を上書きされないようにするため。
 *
 * 実際の出し分けはサーバが行う（AppView が未成年へ成人向けを返さない）。
 * ここが持つのは「なぜ見えないのか」を説明し、申告の導線を出すための状態だけ。
 */

export type AgeState = {
	/** 未取得。ログイン前・同期前。 */
	loading: boolean;
	isAdult: boolean;
	/** 生年月日を申告済みか。false なら未申告＝未成年扱い。 */
	declared: boolean;
	/** 申告した生年月日（YYYY-MM-DD）。本人にだけ返る。未申告なら undefined。 */
	birthDate?: string;
};

const INITIAL: AgeState = { loading: true, isAdult: false, declared: false };

let state = $state<AgeState>({ ...INITIAL });

export const ageAssurance = {
	get loading() {
		return state.loading;
	},
	get isAdult() {
		return state.isAdult;
	},
	get declared() {
		return state.declared;
	},
	/** 本人が設定画面で確認するための値。他人には見えない。 */
	get birthDate() {
		return state.birthDate;
	},
	/** 申告を促すべきか。未申告のユーザーにだけ導線を出す。 */
	get shouldPrompt() {
		return !state.loading && !state.declared;
	},
};

/** getPreferences のレスポンスから取り込む。設定同期と同じ経路に相乗りしている。 */
export function applyAgeAssurance(value?: {
	isAdult: boolean;
	declared: boolean;
	birthDate?: string;
}) {
	state = value
		? { loading: false, ...value }
		: { loading: false, isAdult: false, declared: false };
}

export function clearAgeAssurance() {
	state = { ...INITIAL };
}

export async function loadAgeAssurance(): Promise<void> {
	try {
		applyAgeAssurance((await getPreferences()).ageAssurance);
	} catch {
		// 同期できない端末では未申告扱いのまま。表示制御はサーバがやるので実害はない。
		state = { ...state, loading: false };
	}
}

export type DeclareResult =
	| { ok: true; isAdult: boolean }
	| { ok: false; reason: 'already_set' | 'consent_required' | 'invalid' | 'failed' };

/** 18歳以上かどうかをクライアント側でも判定する（同意チェックの出し分け用）。 */
export function isAdultBirthDate(birthDate: string, now = new Date()): boolean {
	const birth = new Date(`${birthDate}T00:00:00Z`);
	if (Number.isNaN(birth.getTime())) return false;
	const threshold = Date.UTC(now.getUTCFullYear() - 18, now.getUTCMonth(), now.getUTCDate());
	return birth.getTime() <= threshold;
}

/**
 * 生年月日を申告する。1度だけ。サーバが真実源なので、返ってきた確定値で状態を更新する。
 */
export async function declareBirthDate(
	birthDate: string,
	parentalConsent: boolean,
): Promise<DeclareResult> {
	try {
		const view = await putPreferences({ birthDate, parentalConsent });
		applyAgeAssurance(view.ageAssurance);
		return { ok: true, isAdult: view.ageAssurance?.isAdult ?? false };
	} catch (error) {
		if (error instanceof ApiRequestError) {
			if (error.status === 409) {
				// すでに申告済み。サーバの値を取り直して画面を実態に合わせる。
				await loadAgeAssurance();
				return { ok: false, reason: 'already_set' };
			}
			if (/parental_consent/i.test(error.message)) return { ok: false, reason: 'consent_required' };
			if (error.status === 400) return { ok: false, reason: 'invalid' };
		}
		return { ok: false, reason: 'failed' };
	}
}
