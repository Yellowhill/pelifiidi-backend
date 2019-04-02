const db = require('../db');
const { to } = require('./asyncHelpers');

async function addNewWebsite(website) {
	const { name, url, logo } = website;
	const [addedWebsiteError, addedWebsite] = await to(
		db.mutation.createWebsite({
			data: {
				name,
				url,
				logo,
				authors: { create: [] },
				items: { create: [] },
			},
		})
	);
	if (addedWebsiteError)
		return console.log('Error in addNewSiteAndStartPolling', addNewWebsiteError);
	return addedWebsite;
}

module.exports = addNewWebsite;
