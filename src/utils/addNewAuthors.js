const db = require('../db');
const { to } = require('./asyncHelpers');
const { getUniqueAuthors } = require('./core');

async function addNewAuthors(website, authors) {
	const [existingAuthorsError, existingAuthors] = await to(
		db.query.authors(
			{
				where: {
					name_in: authors,
				},
			},
			`{ name}`
		)
	);

	if (existingAuthorsError)
		return console.log('Error in existingAuthorsError', existingAuthorsError);

	const existingAuthorsNameList = existingAuthors.map((author) => author.name);
	const newAuthorsToAdd = getUniqueAuthors(authors.concat(existingAuthorsNameList));
	const newAuthorsToAddPromises = newAuthorsToAdd.map((author) => {
		return db.mutation.createAuthor({
			data: {
				name: author,
				website: { connect: { id: website.id } },
				items: { create: [] },
			},
		});
	});

	return Promise.all(newAuthorsToAddPromises).catch((error) =>
		console.log('Error in AddNewAuthors: ', error)
	);
}

module.exports = addNewAuthors;