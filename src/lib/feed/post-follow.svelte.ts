type PostFollowNotice = {
	href: string;
};

const state = $state<{ notice?: PostFollowNotice }>({});

export const postFollowNotice = {
	get current() {
		return state.notice;
	},
	show(href: string) {
		state.notice = { href };
	},
	clear() {
		state.notice = undefined;
	},
};
