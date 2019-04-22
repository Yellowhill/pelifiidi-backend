require('dotenv').config();
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const jwt = require('jsonwebtoken');
const createServer = require('./utils/createServer');
const db = require('./db');
const getLgNews = require('./sites/lg');
const initializeData = require('./utils/initializeData');

const server = createServer();
server.use(logger('dev'));

//Todo use express middleware to handle cookies
server.express.use(cookieParser());

// decode the JWT so we can get the user Id on each request
server.express.use((req, res, next) => {
	console.log('COOKIES: ', req.cookies);
	const { token } = req.cookies;
	console.log('TOKEN: ', token);
	if (token) {
		const { userId } = jwt.verify(token, process.env.APP_SECRET);
		// put the userId onto the req for future requests to access
		req.userId = userId;
	}
	next();
});

//poluplate current user on each request
// server.express.use(async (req, res, next) => {
// 	// if they aren't logged in, skip this
// 	if (!req.userId) return next();
// 	const user = await db.query.user({ where: { id: req.userId } }, '{ id, email, name }');
// 	req.user = user;
// 	next();
// });

// server.express.use((req, res, next) => {
// 	console.log('req.user', req.user);
// 	console.log('req.headers', req.headers);
// 	next();
// });

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
