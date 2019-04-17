const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');

const Mutation = {
	async signup(parent, args, ctx, info) {
		args.email = args.email.toLowerCase();
		//hash password
		const password = await bcrypt.hash(args.password, 11);
		//create the user in the database
		const user = await ctx.db.mutation.createUser(
			{
				data: {
					...args,
					password,
				},
			},
			info
		);
		//create JWT token for the user
		const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
		//Set the jwt as a cookie on the response
		ctx.response.cookie('token', token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 365, //1 year cookie
		});

		return user;
	},

	async signin(parent, args, ctx, info) {
		//check if the user exists
		const user = await ctx.db.query.user({
			where: {
				email: args.email,
			},
		});
		if (!user) {
			throw new Error(`No such user found for email ${args.email}`);
		}

		//check if password is correct
		const validPassword = await bcrypt.compare(args.password, user.password);
		if (!validPassword) {
			throw new Error('Invalid password');
		}

		//generate jwt token
		const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

		//set the cookie with the token
		ctx.response.cookie('token', token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 365,
		});

		return user;
	},

	signout(parent, args, ctx, info) {
		ctx.response.clearCookie('token');
		return { message: 'Goodbye' };
	},
};

module.exports = Mutation;
