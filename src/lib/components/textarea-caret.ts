/** textarea と同じ折り返しをする不可視ミラーから、キャレットの画面座標を得る。 */
export function textareaCaretRect(
	textarea: HTMLTextAreaElement,
	position = textarea.selectionStart,
) {
	const mirror = document.createElement('div');
	const computed = getComputedStyle(textarea);
	for (const property of computed)
		mirror.style.setProperty(property, computed.getPropertyValue(property));
	const textareaRect = textarea.getBoundingClientRect();
	Object.assign(mirror.style, {
		position: 'fixed',
		left: `${textareaRect.left}px`,
		top: `${textareaRect.top}px`,
		width: `${textareaRect.width}px`,
		height: 'auto',
		minHeight: '0',
		maxHeight: 'none',
		overflow: 'hidden',
		visibility: 'hidden',
		pointerEvents: 'none',
		whiteSpace: 'pre-wrap',
		wordWrap: 'break-word',
	});
	const before = document.createTextNode(textarea.value.slice(0, position));
	const marker = document.createElement('span');
	marker.textContent = '\u200b';
	mirror.append(before, marker);
	document.body.append(mirror);
	const markerRect = marker.getBoundingClientRect();
	mirror.remove();
	const top = markerRect.top - textarea.scrollTop;
	const left = markerRect.left - textarea.scrollLeft;
	const height = Number.parseFloat(computed.lineHeight) || markerRect.height || 20;
	return { left, top, bottom: top + height, height };
}
