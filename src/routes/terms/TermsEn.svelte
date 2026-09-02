<script lang="ts">
	import { CONTACT_EMAIL, CONTACT_SITE, LEGAL_LAST_UPDATED_EN } from '$lib/legal/meta';
</script>

<!-- English translation. If there is any discrepancy, the Japanese version prevails. -->
<h1>Terms of Service</h1>
<p class="updated">Last updated: {LEGAL_LAST_UPDATED_EN}</p>

<p>
	These Terms of Service (the "Terms") set out the conditions for using Nagi (the "Service"). By
	using the Service, you are deemed to have agreed to these Terms. These Terms include the community
	guidelines for keeping the Service a safe place (Sections 5 through 9).
</p>
<div class="summary">
	<h2>Before anything else</h2>
	<ul>
		<li>
			<strong>If you are under 18, use Nagi with your parent or guardian's permission.</strong>
		</li>
		<li><strong>Bot-tan is an AI</strong>, not a human.</li>
		<li><strong>Saying that things are hard is welcome here.</strong></li>
		<li>What we prohibit is <strong>conduct that actually harms people</strong> - nothing more.</li>
		<li>
			<strong>Use a Content Warning (CW) when the content of your post calls for one.</strong>
		</li>
		<li>
			<strong>"Kossori" (quiet) posts are readable only by you and Bot-tan</strong> - though an anonymous
			summary of one may appear in "Support together."
		</li>
	</ul>
</div>

<nav class="toc">
	<h2>Contents</h2>
	<ol>
		<li><a href="#t1">Definitions</a></li>
		<li><a href="#t2">Eligibility</a></li>
		<li><a href="#t3">Accounts and authentication</a></li>
		<li><a href="#t4">Your content and rights</a></li>
		<li><a href="#t5">Our stance</a></li>
		<li><a href="#t6">Prohibited conduct</a></li>
		<li><a href="#t7">Protected expression</a></li>
		<li><a href="#t8">Enforcement</a></li>
		<li><a href="#t9">Reporting</a></li>
		<li><a href="#t10">About the AI features</a></li>
		<li><a href="#t11">Changes, interruption, and termination</a></li>
		<li><a href="#t12">Disclaimer</a></li>
		<li><a href="#t13">Intellectual property</a></li>
		<li><a href="#t14">Privacy</a></li>
		<li><a href="#t15">Governing law and jurisdiction</a></li>
		<li><a href="#t16">Changes to these Terms</a></li>
		<li><a href="#t17">Contact</a></li>
		<li><a href="#t18">Governing language</a></li>
	</ol>
</nav>

<h2 id="t1">1. Definitions</h2>
<p>
	The Service is a fully supportive social network running on the AT Protocol. Your posts are stored
	in your own account (PDS), and the Service acts as an AppView that displays and searches them.
</p>
<ul>
	<li>
		<strong>Service</strong>: Nagi (nagi.suibari.com) and the related features provided by the
		operator.
	</li>
	<li>
		<strong>PDS</strong>: Where your account and records live on the AT Protocol - a provider you
		chose, or a server you run yourself.
	</li>
	<li>
		<strong>AppView</strong>: A system that collects public records from PDSes to display and search
		them. The Service is one of these.
	</li>
	<li><strong>Bot-tan</strong>: The AI-powered character that responds on the Service.</li>
</ul>

<h2 id="t2">2. Eligibility</h2>
<div class="callout">
	<p>
		<strong>If you are under 18, use the Service with your parent or guardian's permission.</strong> Content
		carrying adult labels is not shown to accounts under 18.
	</p>
</div>
<ul>
	<li>
		You may optionally declare your date of birth when you sign up. You can set it only once and
		cannot change it afterwards.
	</li>
	<li>
		<strong>If you have not declared a date of birth, you are treated as being under 18.</strong>
		Content carrying adult labels is not shown to you. Once you turn 18, your declared date of birth makes
		you an adult automatically.
	</li>
	<li>People who were already using the Service before this revision are treated as adults.</li>
</ul>

<h2 id="t3">3. Accounts and authentication</h2>
<ul>
	<li>
		You sign in through AT Protocol OAuth.
		<strong>The operator never receives your password and never stores it.</strong>
	</li>
	<li>When you sign in, you are shown the scope of what the Service may do with your PDS.</li>
	<li>
		Crossposting to Bluesky is off by default; enabling it requires additional consent to a broader
		scope.
	</li>
	<li>
		You are responsible for managing your own account. Letting a third party use your account, or
		using someone else's account without authorization, is prohibited.
	</li>
</ul>

<h2 id="t4">4. Your content and rights</h2>
<ul>
	<li><strong>You retain the rights to the content you post.</strong></li>
	<li>
		The operator uses it only as needed to provide the Service - displaying it in timelines,
		searching, translating, and generating Bot-tan's replies and anonymous summaries.
	</li>
	<li>
		Your posts are stored in your own PDS (except "Kossori" posts - see below). Because of how the
		AT Protocol works, public records can also be fetched and displayed by applications other than
		the Service.
	</li>
</ul>
<div class="callout warn">
	<p>
		<strong>"Kossori" (quiet) posts are readable only by you and Bot-tan.</strong> Their bodies are
		stored on the Service's servers, never in your PDS, so neither other users nor other
		applications can read them, and only you and Bot-tan can reply. In exchange,
		<strong
			>Kossori posts are lost if the Service shuts down and cannot be taken to another app.</strong
		>
		Images cannot be attached.
	</p>
	<p>
		However, <strong
			>an anonymous Bot-tan summary - with neither your name nor the original wording - may appear
			in "Support together."</strong
		> Readers can react to that summary, but they cannot trace it back to you or to the original text.
		Summaries are AI-generated, so they may differ from what you actually wrote.
	</p>
	<p>
		Note that <strong
			>Kossori posts made before 18 August 2026 remain in your PDS as ordinary public records.</strong
		> The Service shows them only to you, but anyone reading your PDS directly can fetch them. To remove
		them, delete the records from your PDS yourself.
	</p>
</div>
<div class="callout">
	<p>
		“Private on this device” while signed out is a device-local feature, separate from ordinary
		Kossori posts. The post and Bot-tan’s reply are stored in your browser and never appear in
		shared timelines, search, profiles, or “Affirm together.” They may be impossible to recover
		after browser-data deletion, the end of a private-browsing session, or loss of the device.
	</p>
	<p>
		An Affirmation Card drawn while signed out is added to your Card File if you sign in during the
		same card day. The local card is deleted after the card-day boundary, and cards from earlier
		days are not added later.
	</p>
</div>
<p>
	Channel-only posts may also be anonymously summarized even though their bodies stay out of shared
	timelines outside the channel. Unlike Kossori posts, they are stored in your PDS as ordinary
	public records. Posts with a Content Warning are excluded from these summaries.
</p>
<p>
	Among the diaries Bot-tan writes,
	<strong>a diary for a day that includes a Kossori post is readable only by you.</strong> Like Kossori
	posts, it is never stored in a PDS. Other users see only the date and the post count (the cell in the
	annual graph on your profile), never the text.
</p>

<h2 id="t5">5. Our stance</h2>
<p>
	Nagi is a place built around receiving what you say before anything else. Sections 5 through 9 are
	the promises that make that possible.
</p>
<ul>
	<li>
		<strong>Receive first.</strong> Feelings you can't quite put into words, complaints, moments of weakness
		- they are welcome here.
	</li>
	<li>
		<strong>Assume difference.</strong> Holding different opinions, values, or ways of living is not a
		problem in itself. If something doesn't sit right with you, choose muting or distance rather than
		attack.
	</li>
	<li>
		<strong>Safety comes first.</strong> Where children, vulnerable people, or someone's emotional safety
		are at stake, we put safety ahead of expression.
	</li>
	<li>
		<strong>Don't deceive.</strong> No impersonating others, and no organized attempts to mislead people.
	</li>
	<li>
		<strong>Follow the law.</strong> The Service is operated under Japanese law. You must also comply
		with the laws of the place where you live.
	</li>
</ul>

<h2 id="t6">6. Prohibited conduct</h2>
<div class="callout">
	<p>
		The following prohibits <em>conduct</em> that actually harms people.
		<strong>
			Disagreement, difficult subject matter, and expressing negative feelings are not themselves
			prohibited.
		</strong>
	</p>
</div>

<h3>6.1 Illegal acts and violation of rights</h3>
<ul>
	<li>Posting, sharing, or soliciting child sexual abuse or exploitation material</li>
	<li>Threats of violence, and incitement to violence or self-harm</li>
	<li>Impersonation, fraud, and phishing</li>
	<li>Infringement of copyright, trademarks, or other rights</li>
	<li>
		Publishing information that identifies a person without their consent (doxxing), and
		non-consensual publication of sexual images
	</li>
	<li>Trading in illegal goods or services</li>
</ul>

<h3>6.2 Attacks on other people</h3>
<ul>
	<li>Sustained harassment of a specific individual, and coordinated targeting</li>
	<li>
		Demeaning, excluding, or attacking people on the basis of race, ethnicity, nationality, origin,
		sex, sexual orientation, gender identity, disability, illness, religion, age, or similar
		attributes
	</li>
	<li>Posts made to insult others or to injure their dignity</li>
</ul>

<h3>6.3 Spam and abuse</h3>
<ul>
	<li>Flooding posts or reactions in a way that gets in the way of other people reading</li>
	<li>Excessive posting from automated accounts</li>
	<li>Spreading misleading links, or repeatedly posting unrelated promotions</li>
</ul>

<h3>6.4 Adult and graphic content</h3>
<p>
	Sexually explicit material and graphic depictions of violence or cruelty are prohibited whether or
	not they have a Content Warning (CW). Sexual depictions involving anyone under 18 are prohibited
	without exception.
</p>
<p>
	Even when content is not prohibited, add a CW to the relevant text or image if it specifically
	depicts sexually suggestive material, injury or blood, violence, self-harm, or similar subject
	matter that may cause severe distress or discomfort when encountered unexpectedly. A CW is not
	required merely for expressing pain, weakness, or other feelings, and this requirement does not
	narrow the expression protected under Section 7.
</p>

<h3>6.5 Attacks on the Service</h3>
<ul>
	<li>Placing excessive load on servers or networks, or otherwise interfering with operation</li>
	<li>Attempting to obtain other people's credentials, or accessing beyond your permissions</li>
	<li>Creating accounts to evade a suspension</li>
</ul>

<h3>6.6 Misuse of AI features</h3>
<ul>
	<li>
		Using AI features for purposes that violate Google's
		<a
			href="https://policies.google.com/terms/generative-ai/use-policy"
			target="_blank"
			rel="noreferrer noopener">Generative AI Prohibited Use Policy</a
		>
	</li>
	<li>
		Attempting to make Bot-tan produce output that violates the above, including prompt injection
	</li>
	<li>Using output from the AI features to develop competing AI models</li>
	<li>Deliberately invoking AI features at volume in order to run up costs</li>
</ul>

<h2 id="t7">7. Protected expression</h2>
<div class="callout">
	<p>
		Nagi cares about being a place where you can say out loud that things are hard.
		<strong>
			So long as it does not attack another person, none of the following is prohibited conduct:
		</strong>
	</p>
</div>
<ul>
	<li>Expressing pain, weakness, complaints, anger, sadness, and other negative feelings</li>
	<li>Expression about your own identity, sexuality, faith, disability, or illness</li>
	<li>Minority opinions, and values that differ from the majority</li>
	<li>Satire and parody, and expression for educational, journalistic, or documentary purposes</li>
</ul>
<p>
	Voicing pain and attacking someone are different things. The operator will draw that line
	carefully and will try not to err toward over-removal.
</p>

<h2 id="t8">8. Moderation and enforcement</h2>
<p>
	To maintain a safe and supportive community, the operator uses automated AI-based moderation.
	Where violations of these Terms or sensitive content are detected, the operator may take the
	following actions according to severity:
</p>
<ol>
	<li>
		<strong>Applying labels and blurs</strong>: Content judged to contain sensitive material (such
		as explicit, violent, or graphic media) is labelled, and client apps show media blurs and
		content warning overlays. Labelled content is not shown to accounts under 18.
	</li>
	<li>
		<strong>Refusing to store it in the AppView</strong>: Content judged to be sexually explicit,
		excessively violent, sexualising a minor, or a severe violation of these Terms (such as hate
		speech or threats) may not be stored in the Service's database at all, and will not be displayed
		on the Service.
	</li>
	<li>Hiding the content on the Service</li>
	<li>A warning to the user and restricting access to features</li>
	<li>Suspending display of the account on the Service</li>
	<li>Reporting to law enforcement where required by law</li>
</ol>
<div class="callout warn">
	<p>
		<strong
			>Hiding or refusing to store content on the Service does not delete the record from your PDS.</strong
		> The Service is an AppView; your posts actually live in your PDS. To delete something completely,
		you must delete the record from your PDS yourself. The operator also cannot stop other AppViews from
		displaying the same public records. "Kossori" posts and the diaries that contain them are the exception:
		they have no counterpart in any PDS, so deleting them on the Service removes them completely.
	</p>
</div>

<h2 id="t9">9. Reporting</h2>
<p>
	If you find a post or account that violates these Terms, please use the
	<a href="#t17">contact details in Section 17</a>. We do not currently offer in-app reporting.
</p>
<ul>
	<li>
		Where possible, include the URL of the post (a Nagi permalink, or an at:// URI) and why you feel
		it is a problem.
	</li>
	<li>We will not disclose the reporter's identity to the person reported.</li>
</ul>

<h2 id="t10">10. About the AI features</h2>
<div class="callout">
	<p>
		<strong>Bot-tan is an AI, not a human.</strong> Bot-tan's replies and conversations, the automatic
		analysis of your profile, diaries, card comments, news selection, and the anonymous summaries in "Support
		together" are all produced by generative AI.
	</p>
</div>
<ul>
	<li>
		AI output may be inaccurate, and may be inappropriate or offensive. The operator does not
		guarantee its accuracy or suitability.
	</li>
	<li>
		<strong>
			AI output is not medical, mental health, legal, financial, or other professional advice.
		</strong> Do not rely on it to make decisions. If you need professional support, please consult a
		professional or a public support service.
	</li>
	<li>
		Identical or similar output may be provided to other users, and no exclusive rights arise in
		that output.
	</li>
	<li>
		AI features may be changed or discontinued without notice, depending on availability and cost.
	</li>
</ul>
<p>
	Providing these features means sending your posts and related data to Google. See the
	<a href="/privacy">Privacy Policy</a> for details.
</p>

<h2 id="t11">11. Changes, interruption, and termination of the Service</h2>
<p>
	The operator may change what the Service does, and may suspend or discontinue it. We will give
	notice where we reasonably can, except in the case of outages or emergency maintenance.
</p>
<p>
	Even if the Service shuts down, your posts remain in your PDS. That is a benefit of building on
	the AT Protocol: in principle, your data is not lost when the Service ends.
	<strong>"Kossori" posts and the diaries that contain them are the one exception</strong> - they are
	never stored in a PDS, so they are lost when the Service ends.
</p>

<h2 id="t12">12. Disclaimer</h2>
<p>
	The Service is a non-commercial service run by an individual and is provided "as is". The operator
	makes no warranty of any kind, express or implied, as to its completeness, accuracy, usefulness,
	fitness for a particular purpose, or continued availability.
</p>
<p>
	Except where liability cannot be excluded by law, the operator is not liable for damages arising
	from use of the Service or from its interruption. The same applies to disputes between users, or
	between a user and a third party.
</p>

<h2 id="t13">13. Intellectual property</h2>
<p>
	Rights in the Service's design, logo, characters including Bot-tan, and content such as the cards
	belong to the operator or the relevant rights holders. Content posted by users is covered by
	Section 4.
</p>

<h2 id="t14">14. Privacy</h2>
<p>
	Handling of information, including personal information, is governed by the
	<a href="/privacy">Privacy Policy</a>, which sets out what the Service stores, where, and which
	external services it sends data to.
</p>

<h2 id="t15">15. Governing law and jurisdiction</h2>
<p>
	These Terms are governed by and construed in accordance with the laws of Japan. You must also
	comply with the laws of the place where you live.
</p>
<p>
	Any dispute relating to the Service shall be brought before the court having jurisdiction over the
	operator's place of residence.
</p>

<h2 id="t16">16. Changes to these Terms</h2>
<p>
	The operator may change these Terms. We will announce significant changes on the Service. If you
	continue to use the Service after a change, you are deemed to have accepted the revised Terms.
</p>

<h2 id="t17">17. Contact</h2>
<p>For questions about these Terms, and for reports, please use the following:</p>
<ul>
	<li>Email: <a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a></li>
	<li>
		Site: <a href={CONTACT_SITE} target="_blank" rel="noreferrer noopener">{CONTACT_SITE}</a>
	</li>
</ul>

<h2 id="t18">18. Governing language</h2>
<p>
	This English text is provided for convenience. If there is any discrepancy between the Japanese
	and English versions, the original Japanese version prevails.
</p>
