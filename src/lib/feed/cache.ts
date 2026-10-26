/** Shared LRU for feed state. The owning shell chooses the cache lifetime. */
export class FeedCache<T> {
	#items = new Map<string, T>();
	constructor(private readonly limit = 8) {}
	get(key: string, create: () => T): T {
		let value = this.#items.get(key);
		if (value === undefined) value = create();
		this.#items.delete(key);
		this.#items.set(key, value);
		if (this.#items.size > this.limit) this.#items.delete(this.#items.keys().next().value!);
		return value;
	}
	values() {
		return this.#items.values();
	}
	clear() {
		this.#items.clear();
	}
}
