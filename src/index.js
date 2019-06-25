require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const jwt = require('jsonwebtoken');
const createServer = require('./utils/createServer');
const initializeData = require('./utils/initializeData');

const app = express();
const path = '/graphql';
const server = createServer();
app.use(logger('dev'));

//Todo use express middleware to handle cookies
app.use(cookieParser());

// decode the JWT so we can get the user Id on each request
app.use((req, res, next) => {
	const { token } = req.cookies;
	//console.log('TOKEN: ', token);
	if (token) {
		const { userId } = jwt.verify(token, process.env.APP_SECRET);
		// put the userId onto the req for future requests to access
		req.userId = userId;
	}
	next();
});

server.applyMiddleware({ app, path });
app.listen({ port: 4444 }, () => {
	initializeData();
	console.log(`🚀 Server ready at AAAA http://localhost:4444${server.graphqlPath}`);
});

// server.start(
// 	{
// 		cors: {
// 			credentials: true,
// 			//origin: process.env.FRONTEND_URL,
// 			origin: [
// 				process.env.FRONTEND_URL,
// 				'http://localhost:3000',
// 				'http://localhost:3000/playground',
// 			],
// 		},
// 		port: 4444,
// 		endpoint: '/graphql',
// 		subscriptions: '/subscriptions',
// 		playground: '/playground',
// 	},
// 	(props) => {
// 		console.log('aa aa  bbbb fasdfasd testing');
// 		initializeData();
// 		console.log(`server is now running on port ${props.port}`);
// 	}
// );
