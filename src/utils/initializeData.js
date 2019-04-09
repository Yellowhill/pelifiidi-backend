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
	addNewItems(scrapeFunc, websiteInfo);
	// setInterval(() => {
	// 	console.log('time: ', new Date());
	// 	addNewItems(scrapeFunc, websiteInfo);
	// }, 60000);
}

async function addNewSiteAndStartPolling(scrapeFunc, websiteInfo) {
	await addNewSiteWithInitData(scrapeFunc, websiteInfo);
	startPollingItems(scrapeFunc, websiteInfo);
}

const dummyItems = [
	{
		title: 'UUUUUUUUUSI1',
		description: 'The Surge ja Conan Exiles huhtikuun Plus-pelien tarjonnassa.',
		url: '1',
		smallImg: 'https://www.livegamers.fi/app/uploads/psplushuhti-220x125.jpg',
		author: 'MavorsXX',
		embeddedYoutubeLinks: ['https://www.youtube.com/embed/VjRCBCzezK0?feature=oembed'],
		textContent: [
			{
				text:
					'Sony on julkistanut huhtikuussa ilmaiseksi tarjottavat PlayStation Plus -pelit.',
				inlineLinks: [],
			},
			{
				text:
					'Tällä kertaa Plus-pelaajat lähtevät kuolemaan ja temmeltämään synkässä ”Robo-Soulsissa” The Surgessa, sekä kunnioittamaan muinaisia jumalia selviytymisseikkailu Conan Exilesissä. The Surgesta meillä Livegamersissa onkin jo , jotta tiedät hieman mitä odottaa.',
				inlineLinks: [
					{ text: 'arvostelu', url: 'https://www.livegamers.fi/arvostelut/the-surge/' },
				],
			},
		],
		publishDate: '2019-03-31T17:35+02:00',
		largeImg: 'https://www.livegamers.fi/app/uploads/psplushuhti-1140x500.jpg',
	},
	{
		title: 'UUUUUUUUUSI2',
		description: 'The Surge ja Conan Exiles huhtikuun Plus-pelien tarjonnassa.',
		url: '2',
		smallImg: 'https://www.livegamers.fi/app/uploads/psplushuhti-220x125.jpg',
		author: 'MavorsXX',
		embeddedYoutubeLinks: ['https://www.youtube.com/embed/VjRCBCzezK0?feature=oembed'],
		textContent: [
			{
				text:
					'Sony on julkistanut huhtikuussa ilmaiseksi tarjottavat PlayStation Plus -pelit.',
				inlineLinks: [],
			},
			{
				text:
					'Tällä kertaa Plus-pelaajat lähtevät kuolemaan ja temmeltämään synkässä ”Robo-Soulsissa” The Surgessa, sekä kunnioittamaan muinaisia jumalia selviytymisseikkailu Conan Exilesissä. The Surgesta meillä Livegamersissa onkin jo , jotta tiedät hieman mitä odottaa.',
				inlineLinks: [
					{ text: 'arvostelu', url: 'https://www.livegamers.fi/arvostelut/the-surge/' },
				],
			},
		],
		publishDate: '2019-03-31T18:35+02:00',
		largeImg: 'https://www.livegamers.fi/app/uploads/psplushuhti-1140x500.jpg',
	},
	{
		title: 'UUUUUUUUUSI3',
		description: 'The Surge ja Conan Exiles huhtikuun Plus-pelien tarjonnassa.',
		url: '3',
		smallImg: 'https://www.livegamers.fi/app/uploads/psplushuhti-220x125.jpg',
		author: 'MavorsXX',
		embeddedYoutubeLinks: ['https://www.youtube.com/embed/VjRCBCzezK0?feature=oembed'],
		textContent: [
			{
				text:
					'Sony on julkistanut huhtikuussa ilmaiseksi tarjottavat PlayStation Plus -pelit.',
				inlineLinks: [],
			},
			{
				text:
					'Tällä kertaa Plus-pelaajat lähtevät kuolemaan ja temmeltämään synkässä ”Robo-Soulsissa” The Surgessa, sekä kunnioittamaan muinaisia jumalia selviytymisseikkailu Conan Exilesissä. The Surgesta meillä Livegamersissa onkin jo , jotta tiedät hieman mitä odottaa.',
				inlineLinks: [
					{ text: 'arvostelu', url: 'https://www.livegamers.fi/arvostelut/the-surge/' },
				],
			},
		],
		publishDate: '2019-04-01T18:35+02:00',
		largeImg: 'https://www.livegamers.fi/app/uploads/psplushuhti-1140x500.jpg',
	},
	{
		title: 'UUUUUUUUUSI4',
		description: 'The Surge ja Conan Exiles huhtikuun Plus-pelien tarjonnassa.',
		url: '4',
		smallImg: 'https://www.livegamers.fi/app/uploads/psplushuhti-220x125.jpg',
		author: 'MavorsXX',
		embeddedYoutubeLinks: ['https://www.youtube.com/embed/VjRCBCzezK0?feature=oembed'],
		textContent: [
			{
				text:
					'Sony on julkistanut huhtikuussa ilmaiseksi tarjottavat PlayStation Plus -pelit.',
				inlineLinks: [],
			},
			{
				text:
					'Tällä kertaa Plus-pelaajat lähtevät kuolemaan ja temmeltämään synkässä ”Robo-Soulsissa” The Surgessa, sekä kunnioittamaan muinaisia jumalia selviytymisseikkailu Conan Exilesissä. The Surgesta meillä Livegamersissa onkin jo , jotta tiedät hieman mitä odottaa.',
				inlineLinks: [
					{ text: 'arvostelu', url: 'https://www.livegamers.fi/arvostelut/the-surge/' },
				],
			},
		],
		publishDate: '2017-04-01T18:35+02:00',
		largeImg: 'https://www.livegamers.fi/app/uploads/psplushuhti-1140x500.jpg',
	},
	{
		title: 'UUUUUUUUUSI5',
		description: 'The Surge ja Conan Exiles huhtikuun Plus-pelien tarjonnassa.',
		url: '5',
		smallImg: 'https://www.livegamers.fi/app/uploads/psplushuhti-220x125.jpg',
		author: 'MavorsXX',
		embeddedYoutubeLinks: ['https://www.youtube.com/embed/VjRCBCzezK0?feature=oembed'],
		textContent: [
			{
				text:
					'Sony on julkistanut huhtikuussa ilmaiseksi tarjottavat PlayStation Plus -pelit.',
				inlineLinks: [],
			},
			{
				text:
					'Tällä kertaa Plus-pelaajat lähtevät kuolemaan ja temmeltämään synkässä ”Robo-Soulsissa” The Surgessa, sekä kunnioittamaan muinaisia jumalia selviytymisseikkailu Conan Exilesissä. The Surgesta meillä Livegamersissa onkin jo , jotta tiedät hieman mitä odottaa.',
				inlineLinks: [
					{ text: 'arvostelu', url: 'https://www.livegamers.fi/arvostelut/the-surge/' },
				],
			},
		],
		publishDate: '2019-04-01T18:36+02:00',
		largeImg: 'https://www.livegamers.fi/app/uploads/psplushuhti-1140x500.jpg',
	},
];

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
