//this file connects to the remote prisma db and gives us the ability to query it with JS
//for exampl ctx.db.query.users
const { Prisma } = require('prisma-binding');
const db = new Prisma({
	typeDefs: 'src/generated/prisma.graphql',
	// endpoint: 'http://localhost:4466/pelifiidi/dev',
	endpoint: process.env.PRISMA_ENDPOINT,
	// secret: process.env.PRISMA_SECRET,
	debug: true,
});

module.exports = db;
