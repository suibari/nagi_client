/** Both feed sources use the same short-lived arrival state. Initial pages stay still. */
export class EntryMotion {
	keys = $state(new Set<string>());
	uris = $state(new Set<string>());
	version = $state(0);
	#generation = 0;

	mark(keys: string[], uris: string[]) {
		if (!keys.length && !uris.length) return;
		if (keys.length) this.version++;
		const generation = ++this.#generation;
		// Retain arrivals from overlapping refreshes until their animation finishes.
		this.keys = new Set([...this.keys, ...keys]);
		this.uris = new Set([...this.uris, ...uris]);
		setTimeout(() => {
			if (generation !== this.#generation) return;
			this.keys = new Set();
			this.uris = new Set();
		}, 700);
	}
}
