require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const jwt = require('jsonwebtoken');
var cors = require('cors');
const https = require('https');
const http = require('http');

const createServer = require('./utils/createServer');
const initializeData = require('./utils/initializeData');

const app = express();
const path = '/graphql';
const apollo = createServer();
const server = http.createServer(app);

app.use(logger('dev'));
app.use(
	cors({
		origin: ['http://localhost:7777', 'ws://localhost:7777'],
		credentials: true,
		methods: ['GET', 'PUT', 'POST'],
		// preflightContinue: true,
		optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
	})
);
//Todo use express middleware to handle cookies
app.use(cookieParser());

// decode the JWT so we can get the user Id on each request
app.use((req, res, next) => {
	const { token } = req.cookies;
	//console.log('TOKEN: ', token)
	if (token) {
		const { userId } = jwt.verify(token, process.env.APP_SECRET);
		// put the userId onto the req for future requests to access
		req.userId = userId;
	}
	next();
});

apollo.applyMiddleware({ app, cors: false });
apollo.installSubscriptionHandlers(server);
server.listen({ port: 4444 }, (diu) => {
	initializeData();
	console.log('Diuuuu', apollo.subscriptionsPath);
	console.log(`🚀 apollo ready at http://localhost:4444${apollo.graphqlPath} --`);
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
