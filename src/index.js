require('dotenv').config();
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const createServer = require('./utils/createServer');
const db = require('./db');
const getLgNews = require('./sites/lg');
const initializeData = require('./utils/initializeData');
const server = createServer();
server.use(logger('dev'));
//Todo use express middleware to handle cookies
server.express.use(cookieParser());
//poluplate current user on each request

server.start(
	{
		cors: {
			credentials: true,
			//origin: process.env.FRONTEND_URL,
			origin: [process.env.FRONTEND_URL, 'http://localhost:3000'],
		},
	},
	(props) => {
		initializeData();
		console.log(`server is now running on port http://localhost:${props.port}`);
	}
);
