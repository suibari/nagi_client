/**
 * モーダル、ポップオーバー、候補一覧などを document.body 直下へ移す。
 * overflow や mask を持つカルーセル／カードの子孫に浮遊UIを残さないための共通入口。
 */
export function portal(node: HTMLElement) {
	document.body.append(node);

	return {
		destroy() {
			node.remove();
		},
	};
}
