<script lang="ts">
	import Icon from '$lib/components/shell/Icon.svelte';
	let {
		href,
		icon,
		title,
		description,
		danger = false,
	} = $props<{
		href: string;
		icon: string;
		title: string;
		description: string;
		danger?: boolean;
	}>();
</script>

<a class="settings-category" class:danger {href}>
	<span class="settings-category-icon"><Icon name={icon} size={24} /></span>
	<span class="settings-category-copy"><strong>{title}</strong><small>{description}</small></span>
	<Icon name="chevron" size={20} />
</a>
