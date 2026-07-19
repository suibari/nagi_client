<script lang="ts">
	let { name, size = 22 }: { name: string; size?: number } = $props();
	const paths: Record<string, string> = {
		home: 'M3 10.8 12 3.5l9 7.3M5.8 9.2V20h12.4V9.2',
		heart:
			'M12 20.2S4.3 15.6 2.8 10.9C1.7 7.4 4.2 4.5 7.3 4.5c1.9 0 3.4 1 4.7 2.9 1.3-1.9 2.8-2.9 4.7-2.9 3.1 0 5.6 2.9 4.5 6.4C19.7 15.6 12 20.2 12 20.2Z',
		bell: 'M6 9.5a6 6 0 0 1 12 0c0 4.6 1.7 5.8 1.7 5.8H4.3S6 14.1 6 9.5M10.3 19a1.8 1.8 0 0 0 3.4 0',
		settings: 'M4 21v-6M4 11V3M12 21v-9M12 8V3M20 21v-4M20 13V3M1.5 15h5M9.5 12h5M17.5 17h5',
		user: 'M20 20.5v-1.4a4.6 4.6 0 0 0-4.6-4.6H8.6A4.6 4.6 0 0 0 4 19.1v1.4M12 10.8a3.9 3.9 0 1 0 0-7.8 3.9 3.9 0 0 0 0 7.8Z',
		trash: 'M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6',
		logout: 'M10 4H5v16h5M14 8l4 4-4 4M18 12H9',
	};
</script>

<svg
	class="icon"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.8"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"><path d={paths[name]} /></svg
>
