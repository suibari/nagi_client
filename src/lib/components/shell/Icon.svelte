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
		reply: 'M9 8 4 12l5 4v-3h4.5c3.2 0 5.2 1.2 6.5 4-0.2-5.5-2.8-8-7.5-8H9V8Z',
		quote: 'M7 7h4v4H7v5H4v-5c0-2.2 1-3.5 3-4ZM17 7h3v4h-3v5h-3v-5c0-2.2 1-3.5 3-4Z',
		logout: 'M10 4H5v16h5M14 8l4 4-4 4M18 12H9',
		profile: 'M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z',
		sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
		language: 'M4 5h11M9.5 3v2M6 5c.7 4 3.2 7 7 9M13 5c-.8 4-3.4 7.4-7 9M14 21l4-10 4 10M15.5 17h5',
		info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 10v7M12 7h.01',
		chevron: 'm9 18 6-6-6-6',
		image: 'M4 5h16v14H4V5Zm0 11 4.5-4.5 3.5 3 2.5-2.5 5.5 5M9 9h.01',
		close: 'M5 5l14 14M19 5 5 19',
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
