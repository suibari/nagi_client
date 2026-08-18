class GuestComposerHost {
	open = $state(false);
	show() {
		this.open = true;
	}
	hide() {
		this.open = false;
	}
}
export const guestComposerHost = new GuestComposerHost();
