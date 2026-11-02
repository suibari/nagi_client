// プリレンダHTMLのヒーローを、OAuth復元が始まる前の初回描画から隠す。
// 認証確認が終わったら +layout.svelte が属性を外す。
document.documentElement.setAttribute('data-oauth-pending', '');
