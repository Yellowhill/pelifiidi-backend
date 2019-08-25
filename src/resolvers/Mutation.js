const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const { transport, makeANiceEmail } = require('../mail');
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
		//Set the jwt as a cookie on the res
		ctx.res.cookie('token', token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 365, //1 year cookie
		});

		return user;
	},

	async signin(parent, args, ctx, info) {
		console.log('SIGNIN CTX: ', ctx);
		//check if the user exists
		const user = await ctx.db.query.user(
			{
				where: {
					email: args.email,
				},
			},
			info
		);

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
		ctx.res.cookie('token', token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 365,
		});

		return user;
	},

	signout(parent, args, ctx, info) {
		ctx.res.clearCookie('token');
		return { message: 'Goodbye' };
	},

	async requestReset(parent, args, ctx, info) {
		// 1. Check if this is a real user
		const user = await ctx.db.query.user({ where: { email: args.email } });
		if (!user) {
			throw new Error(`No such user found for email ${args.email}`);
		}
		// 2. Set a reset token and expiry on that user
		const randomBytesPromiseified = promisify(randomBytes);
		const resetToken = (await randomBytesPromiseified(20)).toString('hex');
		const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
		const res = await ctx.db.mutation.updateUser({
			where: { email: args.email },
			data: { resetToken, resetTokenExpiry },
		});
		// 3. Email them that reset token
		const mailRes = await transport.sendMail({
			from: 'je@kel.com',
			to: user.email,
			subject: 'Your Password Reset Token',
			html: makeANiceEmail(`Your Password Reset Token is here!
		  \n\n
		  <a href="${
				process.env.FRONTEND_URL
			}/reset?resetToken=${resetToken}">Click Here to Reset</a>`),
		});

		// 4. Return the message
		return { message: 'Thanks!' };
	},

	async resetPassword(parent, args, ctx, info) {
		// 1. check if the passwords match
		if (args.password !== args.confirmPassword) {
			throw new Error("Yo Passwords don't match!");
		}
		// 2. check if its a legit reset token
		// 3. Check if its expired
		const [user] = await ctx.db.query.users({
			where: {
				resetToken: args.resetToken,
				resetTokenExpiry_gte: Date.now() - 3600000,
			},
		});
		if (!user) {
			throw new Error('This token is either invalid or expired!');
		}
		// 4. Hash their new password
		const password = await bcrypt.hash(args.password, 10);
		// 5. Save the new password to the user and remove old resetToken fields
		const updatedUser = await ctx.db.mutation.updateUser({
			where: { email: user.email },
			data: {
				password,
				resetToken: null,
				resetTokenExpiry: null,
			},
		});
		// 6. Generate JWT
		const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
		// 7. Set the JWT cookie
		ctx.res.cookie('token', token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 365,
		});
		// 8. return the new user
		return updatedUser;
	},

	async addBookmark(parent, args, ctx, info) {
		// 1. Check if this is a real user
		const userFromDb = await ctx.db.query.user({ where: { id: ctx.req.userId } });
		if (!userFromDb) {
			throw new Error(`No such user found`);
		}

		const updatedUserFromDb = ctx.db.mutation.updateUser(
			{
				where: { id: userFromDb.id },
				data: { bookmarks: { connect: { id: args.id } } },
			},
			info
		);

		if (!updatedUserFromDb) {
			throw new Error('Add bookmark operation failed!');
		}

		return updatedUserFromDb;
	},

	async removeBookmark(parent, args, ctx, info) {
		// 1. Check if this is a real user
		const userFromDb = await ctx.db.query.user({ where: { id: ctx.req.userId } });
		if (!userFromDb) {
			throw new Error(`No such user found`);
		}

		const updatedUserFromDb = ctx.db.mutation.updateUser(
			{
				where: { id: userFromDb.id },
				data: { bookmarks: { disconnect: { id: args.id } } },
			},
			info
		);

		if (!updatedUserFromDb) {
			throw new Error('remove bookmark operation failed!');
		}

		return updatedUserFromDb;
	},
};

module.exports = Mutation;
