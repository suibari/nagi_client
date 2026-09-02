export interface FloatingAnchorRect {
	left: number;
	right: number;
	top: number;
	bottom: number;
}

export interface FloatingViewport {
	left: number;
	top: number;
	width: number;
	height: number;
}

export interface FloatingMenuPosition {
	left: number;
	top: number;
	width: number;
	maxHeight: number;
	placement: 'above' | 'below';
}

/**
 * body 直下へ portal した fixed メニューを、表示中のブラウザ領域へ収める。
 * visualViewport の offset も受け取れるので、モバイルの表示領域移動にも追従できる。
 */
export function positionFloatingMenu(
	anchor: FloatingAnchorRect,
	viewport: FloatingViewport,
	menuHeight: number,
	preferredWidth = 320,
	margin = 12,
	gap = 8,
): FloatingMenuPosition {
	const viewportRight = viewport.left + viewport.width;
	const viewportBottom = viewport.top + viewport.height;
	const width = Math.max(0, Math.min(preferredWidth, viewport.width - margin * 2));
	const left = Math.min(
		Math.max(viewport.left + margin, anchor.left),
		viewportRight - margin - width,
	);
	const above = Math.max(0, anchor.top - gap - (viewport.top + margin));
	const below = Math.max(0, viewportBottom - margin - (anchor.bottom + gap));
	const placement = below >= menuHeight || below >= above ? 'below' : 'above';
	const maxHeight = Math.max(0, placement === 'below' ? below : above);
	const renderedHeight = Math.min(menuHeight, maxHeight);
	const top =
		placement === 'below'
			? anchor.bottom + gap
			: Math.max(viewport.top + margin, anchor.top - gap - renderedHeight);

	return { left, top, width, maxHeight, placement };
}
