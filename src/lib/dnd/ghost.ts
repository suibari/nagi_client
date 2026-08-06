/**
 * ドラッグ中に指（ポインタ）へ追従する半透明のコピーを作る。
 * 元のタイル／行は grid や flex のレイアウトに縛られているので動かせない。body 直下に
 * position: fixed のクローンを置いて、そちらを動かす。
 *
 * 既知の制限: Lottie カスタム絵文字の <canvas> は cloneNode してもピクセルが
 * 複製されないため、ゴーストが空になる。静止画への差し替えは将来の改善余地。
 */
export function createDragGhost(
	source: HTMLElement,
	clientX: number,
	clientY: number,
	ghostClass: string,
) {
	const rect = source.getBoundingClientRect();
	const offsetX = clientX - rect.left;
	const offsetY = clientY - rect.top;
	const ghost = source.cloneNode(true) as HTMLElement;
	ghost.classList.remove('dragging', 'drop-target');
	ghost.classList.add(ghostClass);
	ghost.setAttribute('aria-hidden', 'true');
	ghost.style.width = `${rect.width}px`;
	ghost.style.height = `${rect.height}px`;
	// クローンした中身がタブ順に混ざらないようにする。
	for (const control of ghost.querySelectorAll<HTMLElement>('button, input')) {
		control.tabIndex = -1;
	}

	const move = (x: number, y: number) => {
		ghost.style.left = `${x - offsetX}px`;
		ghost.style.top = `${y - offsetY}px`;
	};

	document.body.append(ghost);
	move(clientX, clientY);
	return { move, remove: () => ghost.remove() };
}
