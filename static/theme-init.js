// 初回描画前に保存済みのテーマ/ロケールを適用し、ちらつきを防ぐ。
// インラインscriptのハッシュ無しで厳格な CSP（script-src 'self'）を配信できるよう、
// あえて外部ファイルとして分離している。
(function () {
	try {
		var theme = localStorage.getItem('nagi-theme');
		var palette = localStorage.getItem('nagi-theme-palette');
		var palettes = ['bot-mint', 'latte-pink', 'kotomi-orange', 'morpho-blue', 'simple'];
		var colors = {
			'bot-mint': { light: '#f4fafa', dark: '#08110f' },
			'latte-pink': { light: '#fbf8f9', dark: '#110f10' },
			'kotomi-orange': { light: '#fbf9f6', dark: '#12100e' },
			'morpho-blue': { light: '#f7f9fc', dark: '#090e14' },
			simple: { light: '#ffffff', dark: '#000000' },
		};
		if (palettes.indexOf(palette) === -1) palette = 'bot-mint';
		document.documentElement.setAttribute('data-palette', palette);
		var dark =
			theme === 'dark' ||
			(theme !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
		var themeColor = document.querySelector('meta[name="theme-color"]');
		if (themeColor) themeColor.setAttribute('content', colors[palette][dark ? 'dark' : 'light']);
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (event) {
			var currentTheme = localStorage.getItem('nagi-theme');
			if (currentTheme !== 'light' && currentTheme !== 'dark' && themeColor) {
				var currentPalette = localStorage.getItem('nagi-theme-palette');
				if (palettes.indexOf(currentPalette) === -1) currentPalette = 'bot-mint';
				themeColor.setAttribute(
					'content',
					colors[currentPalette][event.matches ? 'dark' : 'light'],
				);
			}
		});
		if (theme === 'light' || theme === 'dark') {
			document.documentElement.setAttribute('data-theme', theme);
			document.documentElement.style.colorScheme = theme;
		} else {
			document.documentElement.removeAttribute('data-theme');
			document.documentElement.style.colorScheme = 'light dark';
		}
	} catch (_) {
		document.documentElement.style.colorScheme = 'light dark';
	}
	try {
		var locale = localStorage.getItem('nagi-locale');
		if (locale !== 'ja' && locale !== 'en') {
			locale = (navigator.language || '').toLowerCase().indexOf('ja') === 0 ? 'ja' : 'en';
		}
		document.documentElement.lang = locale;
	} catch (_) {
		/* keep the static lang fallback */
	}
})();
