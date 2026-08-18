import type { DiaryView } from '$lib/api/types';

/** 本人限定という属性ではなく、このレスポンスで本文が伏せられたかを判定する。 */
export const isDiaryBodyHidden = (diary: DiaryView | undefined): boolean =>
	diary?.bodyHidden === true;
