const { GraphQLServer } = require('graphql-yoga');
const Mutation = require('../resolvers/Mutation');
const Query = require('../resolvers/Query');
const Subscription = require('../resolvers/Subscription');
const db = require('../db');

// Create the GraphQL Yoga Server
function createServer() {
	return new GraphQLServer({
		typeDefs: 'src/schema.graphql',
		resolvers: {
			Mutation,
			Query,
			Subscription,
		},
		resolverValidationOptions: {
			requireResolversForResolveType: false,
		},
		context: (req) => {
			// console.log('context req: ', req);
			return { ...req, db };
		},
	});
}

module.exports = createServer;
