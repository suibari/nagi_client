<script lang="ts">
	let {
		tags,
		clickable = true,
		className = '',
	}: {
		tags: readonly string[];
		clickable?: boolean;
		className?: string;
	} = $props();
</script>

<ul class={`profile-tag-list${className ? ` ${className}` : ''}`}>
	{#each tags as tag, index (`${index}:${tag}`)}
		<li>
			{#if clickable}
				<a href={`/search?q=${encodeURIComponent(tag)}`}>#{tag}</a>
			{:else}
				<span>#{tag}</span>
			{/if}
		</li>
	{/each}
</ul>
