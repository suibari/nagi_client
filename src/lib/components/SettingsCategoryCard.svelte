<script lang="ts">
	import Icon from '$lib/components/shell/Icon.svelte';
	let {
		href = undefined,
		icon,
		title,
		description,
		danger = false,
		onclick = undefined,
	} = $props<{
		href?: string;
		icon: string;
		title: string;
		description: string;
		danger?: boolean;
		onclick?: () => void;
	}>();
</script>

{#if onclick}
	<button type="button" class="settings-category" class:danger {onclick}>
		<span class="settings-category-icon"><Icon name={icon} size={24} /></span>
		<span class="settings-category-copy"><strong>{title}</strong><small>{description}</small></span>
	</button>
{:else}
	<a class="settings-category" class:danger {href}>
		<span class="settings-category-icon"><Icon name={icon} size={24} /></span>
		<span class="settings-category-copy"><strong>{title}</strong><small>{description}</small></span>
		<Icon name="chevron" size={20} />
	</a>
{/if}
