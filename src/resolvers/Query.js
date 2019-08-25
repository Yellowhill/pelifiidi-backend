const { forwardTo } = require('prisma-binding');
const Query = {
	items: forwardTo('db'),
	item: forwardTo('db'),
	itemsConnection: forwardTo('db'),

	me(parent, args, ctx, info) {
		// check if there is a current user ID
		if (!ctx.req.userId) {
			return null;
		}
		return ctx.db.query.user(
			{
				where: { id: ctx.req.userId },
			},
			info
		);
	},
};

module.exports = Query;
