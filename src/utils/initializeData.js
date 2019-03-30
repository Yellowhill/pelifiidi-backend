const db = require('../db');
const { to } = require('./asyncHelpers');
const getLgNews = require('../sites/lg');

function initializeData() {
	initializeLivegamers();
}

async function initializeLivegamers() {
	const [error, lgExists] = await to(db.exists.Website({ name_in: ['Livegamers'] }));
	if (error) return console.log('Error in initializeLivegamers: ', error);
	if (lgExists) {
		console.log('lg exists!');
		getLgNews();
	} else {
		addAndStartPollingLivegamers();
	}
}

async function addAndStartPollingLivegamers() {
	const initialItems = await getLgNews();
	console.log('itinital items: ', initialItems);
	// const [error, lg] = await to(
	// 	db.mutation.createWebsite({
	// 		data: {
	// 			name: 'Livegamers',
	// 			url: 'https://www.livegamers.fi',
	// 			logo:
	// 				'https://pbs.twimg.com/profile_images/990952341867237377/OQJ_G7IX_400x400.jpg',
	// 			authors: { create: [] },
	// 			items: { create: [] },
	// 		},
	// 	})
	// );
	//if (error) return console.log('Error in addAndStartPollingLivegamers', error);
}

// function initialAuthorsObject() = {
//     return {create:[]}
// }
module.exports = initializeData;
