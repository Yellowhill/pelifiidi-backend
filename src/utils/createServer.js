const { ApolloServer, gql } = require('apollo-server-express');
const { importSchema } = require('graphql-import');
const Mutation = require('../resolvers/Mutation');
const Query = require('../resolvers/Query');
const Subscription = require('../resolvers/Subscription');
const db = require('../db');

const importedTypeDefs = importSchema('src/schema.graphql');
const typeDefs = gql`
	${importedTypeDefs}
`;

// Create the GraphQL Yoga Server
function createServer() {
	return new ApolloServer({
		typeDefs,
		resolvers: {
			Mutation,
			Query,
			Subscription,
		},
		introspection: true,
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
