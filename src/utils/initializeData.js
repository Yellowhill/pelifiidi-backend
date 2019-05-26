const db = require('../db');
const { to } = require('./asyncHelpers');
const getLgNews = require('../sites/lg');
const addNewItems = require('./addNewItems');
const addNewSiteWithInitData = require('./addNewSiteWithInitData');

function initializeData() {
	initializeLivegamers();
}

const lgInfo = {
	name: 'Livegamers',
	url: 'https://www.livegamers.fi',
	logo: 'https://pbs.twimg.com/profile_images/990952341867237377/OQJ_G7IX_400x400.jpg',
};

async function initializeLivegamers() {
	const [lgExistsError, lgExists] = await to(
		db.exists.Website({ name_in: ['Livegamers'] })
	);
	if (lgExistsError) return console.log('Error in initializeLivegamers: ', lgExistsError);

	if (lgExists) {
		startPollingItems(getLgNews, lgInfo);
	} else {
		addNewSiteAndStartPolling(getLgNews, lgInfo);
	}
}

function startPollingItems(scrapeFunc, websiteInfo) {
	//addNewItems(scrapeFunc, websiteInfo);
	setInterval(() => {
		console.log('time: ', new Date());
		addNewItems(scrapeFunc, websiteInfo);
	}, 300000); //5min
}

async function addNewSiteAndStartPolling(scrapeFunc, websiteInfo) {
	await addNewSiteWithInitData(scrapeFunc, websiteInfo);
	startPollingItems(scrapeFunc, websiteInfo);
}

module.exports = initializeData;

/**playground
 * 
 *
 * 
mutation {
  createItem (
    data:{
  		title: "testi title",
  		url: "testiurl1.com",
  		publishDate: "2019-04-04T18:18:00.000Z",
  		author: {
        connect: {
    			id: "5ca89c89a7b11b00076b4ec1"
  		}}
  		website: {
    		connect: {
      		id: "5ca89c89a7b11b00076b4ec0"
    		}
			}
			slug: "testi-slug"
  		textContent: {
    		create: [{
    			text: "diu diu",
    			inlineLinks: {
      		create: []
    			}
  			}]
  	}
    }) {id title}
}
}
 * 
 */
