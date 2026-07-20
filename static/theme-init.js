// 初回描画前に保存済みのテーマ/ロケールを適用し、ちらつきを防ぐ。
// インラインscriptのハッシュ無しで厳格な CSP（script-src 'self'）を配信できるよう、
// あえて外部ファイルとして分離している。
(function () {
	try {
		var theme = localStorage.getItem('nagi-theme');
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
