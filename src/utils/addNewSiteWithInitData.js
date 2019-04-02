const addNewWebsite = require('./addNewWebsite');
const addNewItems = require('./addNewItems');
const addNewAuthors = require('./addNewAuthors');

const { getUniqueAuthors } = require('./core');

async function addNewSiteWithInitData(scrapeFunc, website) {
	const initialItems = await scrapeFunc();
	const authors = getUniqueAuthors(initialItems.map((item) => item.author));
	const addedWebsite = await addNewWebsite(website);
	await addNewAuthors(addedWebsite, authors);
	await addNewItems(scrapeFunc, website);
}

module.exports = addNewSiteWithInitData;
