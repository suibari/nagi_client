import { expect, test } from '@playwright/test';

test('built Service Worker receives a multipart share locally and redirects to its receipt', async ({
	page,
	baseURL,
}) => {
	test.skip(
		!baseURL?.endsWith(':4181'),
		'Run with playwright.share-preview.config.ts after building',
	);
	await page.goto('/share-target');
	await page.evaluate(async () => {
		await navigator.serviceWorker.ready;
		if (!navigator.serviceWorker.controller)
			await new Promise<void>((resolve) =>
				navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), {
					once: true,
				}),
			);
	});
	await page.evaluate(async () => {
		const canvas = document.createElement('canvas');
		canvas.width = canvas.height = 2;
		const blob = await new Promise<Blob>((resolve) => canvas.toBlob((value) => resolve(value!)));
		const form = document.createElement('form');
		form.method = 'POST';
		form.action = '/share-target';
		form.enctype = 'multipart/form-data';
		const text = document.createElement('input');
		text.name = 'text';
		text.value = 'Service Worker shared text';
		form.append(text);
		const input = document.createElement('input');
		input.type = 'file';
		input.name = 'images';
		const data = new DataTransfer();
		data.items.add(new File([blob], 'shared.png', { type: 'image/png' }));
		input.files = data.files;
		form.append(input);
		document.body.append(form);
		form.submit();
	});
	await expect(page).toHaveURL(/\/share-target\?id=/);
	await expect(page.locator('.share-page pre')).toHaveText('Service Worker shared text');
	await expect(page.locator('.share-page li')).toHaveText('shared.png');
	const stored = await page.evaluate(async () => {
		const id = new URL(location.href).searchParams.get('id');
		const db = await new Promise<IDBDatabase>((resolve) => {
			const r = indexedDB.open('nagi-share-target');
			r.onsuccess = () => resolve(r.result);
		});
		const result = await new Promise<{ text: string; fileName: string; size: number }>(
			(resolve) => {
				const request = db.transaction('received').objectStore('received').get(id!);
				request.onsuccess = () =>
					resolve({
						text: request.result.text,
						fileName: request.result.files[0].file.name,
						size: request.result.files[0].file.size,
					});
			},
		);
		db.close();
		return result;
	});
	expect(stored.text).toBe('Service Worker shared text');
	expect(stored.fileName).toBe('shared.png');
	expect(stored.size).toBeGreaterThan(0);
	const manifest = await (await page.request.get('/manifest.webmanifest')).json();
	expect(manifest.share_target.method).toBe('POST');
	expect(manifest.share_target.params.files[0].name).toBe('images');
	expect((await page.request.get('/no-such-share-target-page')).status()).toBe(404);
	expect(
		(await page.request.post('/share-target', { form: { text: 'without SW' } })).status(),
	).toBeGreaterThanOrEqual(400);
});
