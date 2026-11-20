import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './tests/e2e',
	testMatch: 'share-target-sw.spec.ts',
	use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:4181' },
	webServer: {
		command: 'npm run preview -- --host 127.0.0.1 --port 4181',
		url: 'http://127.0.0.1:4181/share-target',
		timeout: 30_000,
	},
});
