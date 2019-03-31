const db = require('../db');
const { to } = require('./asyncHelpers');
const getLgNews = require('../sites/lg');

function initializeData() {
	initializeLivegamers();
}

async function initializeLivegamers() {
	const [error, lgExists] = await to(db.exists.Website({ name_in: ['Livegamers'] }));
	if (error) return console.log('Error in initializeLivegamers: ', error);
	console.log('lgExists-------------------------------------? ', lgExists);
	if (lgExists) {
		const websiteInfo = {
			name: 'Livegamers',
			url: 'https://www.livegamers.fi',
			logo:
				'https://pbs.twimg.com/profile_images/990952341867237377/OQJ_G7IX_400x400.jpg',
		};

		const initialItems = await getLgNews();

		const [addNewNewsItemsError, newItems] = await to(
			addNewNewsItems(websiteInfo, initialItems)
		);
		if (addNewNewsItemsError)
			return console.log('Error in addNewNewsItemsError: ', addNewNewsItemsError);
		console.log('--------------newItems-------------: ', newItems);
		// const [existingAuthorsError, existingAuthors] = await to(
		// 	db.query.authors(
		// 		{
		// 			where: {
		// 				name_in: ['iletz'],
		// 			},
		// 		},
		// 		`{name}`
		// 	)
		// );
		// if (existingAuthorsError)
		// 	return console.log('Error in existingAuthorsError', existingAuthorsError);
		// console.log('existing authors: ', existingAuthors[0].name);
	} else {
		const websiteInfo = {
			name: 'Livegamers',
			url: 'https://www.livegamers.fi',
			logo:
				'https://pbs.twimg.com/profile_images/990952341867237377/OQJ_G7IX_400x400.jpg',
		};
		addNewSiteWithInitialData(getLgNews, websiteInfo);
	}
}

async function addNewSiteWithInitialData(scrapeFunc, website) {
	const initialItems = await scrapeFunc();
	const authors = getUniqueAuthors(initialItems.map((item) => item.author));

	const [addNewWebsiteError, addedWebsite] = await to(addNewWebsite(website));
	if (addNewWebsiteError)
		return console.log('Error in addNewSiteAndStartPolling', addNewWebsiteError);

	console.log('addedWebsite', addedWebsite);

	const [addAuthorsToWebsiteError, addedAuthors] = await to(
		addAuthorsToWebsite(addedWebsite, authors)
	);

	if (addAuthorsToWebsiteError)
		return console.log('Error in addAuthorsToWebsite', addAuthorsToWebsiteError);

	const [addItemsError, addedItems] = await addNewNewsItems(initialItems);
}

async function addNewWebsite(website) {
	const { name, url, logo } = website;
	return db.mutation.createWebsite({
		data: {
			name,
			url,
			logo,
			authors: { create: [] },
			items: { create: [] },
		},
	});
}

async function addAuthorsToWebsite(website, authors) {
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

	console.log('newAuthorsToAdd: ', newAuthorsToAdd);

	const authorsPromise = newAuthorsToAdd.map((author) => {
		return db.mutation.createAuthor({
			data: {
				name: author,
				website: { connect: { id: website.id } },
				items: { create: [] },
			},
		});
	});

	return Promise.all(authorsPromise);
}

async function addNewNewsItems(website, allItems) {
	// console.log('addNewNewsItems: ', allItems[0]);
	const latestItem = {
		publishDate: new Date(),
	};

	const newItems = allItems.filter((item) => item.publishDate > latestItem.publishDate);

	// const latestDbItem = db.query.items({
	// 	where: { website: { where: { name: website.name } } },
	// 	orderBy: 'publishDate_DESC',
	// 	first: 1,
	// });

	const promises = dummyItems.map((item) => {
		const { textContent, embeddedYoutubeLinks, ...restProps } = item;
		const textContentData = createTextContentObject(textContent);
		console.log('textContentData: ', textContentData);
		const newItemData = {
			...restProps,
			embeddedYoutubeLinks: { set: embeddedYoutubeLinks },
			author: {
				connect: {
					name: item.author,
				},
			},
			website: {
				connect: {
					name: website.name,
				},
			},
			textContent: {
				create: textContentData,
			},
		};
		return db.mutation.createItem({ data: newItemData });
	});

	return promises;
}

function createTextContentObject(textContent) {
	console.log('createTextContentObject: ', typeof textContent);
	return textContent.map((content) => {
		const inlineLinks = content.inlineLinks.map((linkInfo) => {
			return {
				text: linkInfo.text,
				url: linkInfo.url,
			};
		});

		return {
			inlineLinks: { create: inlineLinks },
			text: content.text,
		};
	});
}

function getUniqueAuthors(authors) {
	console.log('getUniqueAuthors authors: ', authors);
	return [...new Set(authors)];
}

const dummyItems = [
	{
		title: 'UUUUUUUUUSI',
		description: 'The Surge ja Conan Exiles huhtikuun Plus-pelien tarjonnassa.',
		url:
			'https://www.livegamers.fi/uutiset/huhtikuussa-robo-soulsia-ja-selviytymista-conanin-maailmassa/',
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
];

module.exports = initializeData;
