require('dotenv').config();
const logger = require('morgan');
const createServer = require('./createServer');
const db = require('./db');
const getLgNews = require('./sites/lg');

const server = createServer();
server.use(logger('dev'));
//Todo use express middleware to handle cookies
//poluplate current user on each request

getLgNews();

server.start(
	{
		cors: {
			credentials: true,
			origin: process.env.FRONTEND_URL,
		},
	},
	(deets) => {
		console.log(`server is now running on port http://localhost:${deets.port}`);
	}
);
