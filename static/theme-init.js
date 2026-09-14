// 初回描画前に保存済みのテーマ/ロケールを適用し、ちらつきを防ぐ。
// インラインscriptのハッシュ無しで厳格な CSP（script-src 'self'）を配信できるよう、
// あえて外部ファイルとして分離している。
(function () {
	try {
		var theme = localStorage.getItem('nagi-theme');
		var palette = localStorage.getItem('nagi-theme-palette');
		var palettes = ['bot-mint', 'latte-pink', 'kotomi-orange', 'morpho-blue', 'simple'];
		var colors = {
			'bot-mint': { light: '#f7f9f9', dark: '#090d0c' },
			'latte-pink': { light: '#fafafa', dark: '#101010' },
			'kotomi-orange': { light: '#f8f8f8', dark: '#101010' },
			'morpho-blue': { light: '#f7f9fc', dark: '#090e14' },
			simple: { light: '#ffffff', dark: '#000000' },
		};
		if (palettes.indexOf(palette) === -1) palette = 'bot-mint';
		document.documentElement.setAttribute('data-palette', palette);
		var themeColors = document.querySelectorAll('meta[name="theme-color"]');
		var lightColor = colors[palette].light;
		var darkColor = colors[palette].dark;
		for (var i = 0; i < themeColors.length; i += 1) {
			var themeColor = themeColors[i];
			var color = theme === 'light' ? lightColor : theme === 'dark' ? darkColor : undefined;
			if (!color) {
				color = themeColor.media.indexOf('dark') === -1 ? lightColor : darkColor;
			}
			themeColor.setAttribute('content', color);
		}
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
