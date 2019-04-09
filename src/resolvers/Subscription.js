const { forwardTo } = require('prisma-binding');
const Subscription = {
	item: {
		subscribe: forwardTo('db'),
	},
};

module.exports = Subscription;
