<script lang="ts">
	import { i18n } from '$lib/i18n/i18n.svelte';
</script>

<section class="card prose">
	{#if i18n.locale === 'ja'}
		<h1>プライバシーポリシー</h1>
		<p class="updated">最終更新日: 2026年7月19日（ドラフト）</p>
		<p>Nagi（以下「本サービス」）における情報の取り扱いについて定めます。</p>
		<h2>1. 取得する情報</h2>
		<ul>
			<li>AT ProtocolのDID・ハンドル・公開プロフィール</li>
			<li>本サービス上の投稿・リアクションなどの公開レコード</li>
		</ul>
		<p>ログインはOAuthで行われ、本サービスがパスワードを受け取ることはありません。</p>
		<h2>2. 情報の利用目的</h2>
		<ul>
			<li>タイムライン・プロフィールなど本サービスの機能提供</li>
			<li>AIによる自動返信（全肯定botたん）の生成</li>
			<li>不正利用の防止</li>
		</ul>
		<h2>3. 第三者提供</h2>
		<p>
			公開レコードはAT
			Protocolの仕組み上、他のサービスからも参照可能です。それ以外の情報を本人の同意なく第三者に提供することはありません。
		</p>
		<h2>4. お問い合わせ</h2>
		<p>本ポリシーに関するお問い合わせは、運営者までご連絡ください。</p>
	{:else}
		<!-- English draft translation, pending human review. The Japanese version prevails. -->
		<h1>Privacy Policy</h1>
		<p class="updated">Last updated: July 19, 2026 (draft)</p>
		<p>This policy describes how Nagi (the "Service") handles information.</p>
		<h2>1. Information we collect</h2>
		<ul>
			<li>Your AT Protocol DID, handle, and public profile</li>
			<li>Public records on the Service, such as posts and reactions</li>
		</ul>
		<p>Login is performed via OAuth; the Service never receives your password.</p>
		<h2>2. How we use information</h2>
		<ul>
			<li>Providing Service features such as the timeline and profiles</li>
			<li>Generating automatic AI replies (the fully affirming Bot-tan)</li>
			<li>Preventing abuse</li>
		</ul>
		<h2>3. Sharing with third parties</h2>
		<p>
			By the nature of the AT Protocol, public records can also be accessed by other services. No
			other information is provided to third parties without your consent.
		</p>
		<h2>4. Contact</h2>
		<p>For inquiries about this policy, please contact the operator.</p>
		<h2>5. Governing language</h2>
		<p>
			This English text is provided for convenience. If there is any discrepancy between the
			Japanese and English versions, the original Japanese version prevails.
		</p>
	{/if}
</section>
