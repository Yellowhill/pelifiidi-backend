const { isAfter } = require('date-fns');
const { to } = require('./asyncHelpers');
const db = require('../db');

async function addNewItems(scrapeFunc, website) {
	const items = await scrapeFunc();
	const latestItemPublishDate = await getLatestItemPublishDate();
	console.log('latestItemPublishDate: ', latestItemPublishDate);

	const newItems = items.filter((item) =>
		isAfter(item.publishDate, latestItemPublishDate)
	);

	if (newItems.length > 0) {
		const newItemsPromises = newItems.map((item) => {
			const { textContent, embeddedYoutubeLinks, ...restProps } = item;
			const textContentData = createTextContentObject(textContent);
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

		return Promise.all(newItemsPromises).catch((error) =>
			console.log('Error in AddNewItems: ', error)
		);
	} else {
		return [];
	}
}

async function getLatestItemPublishDate() {
	const [itemsQueryError, items] = await to(
		db.query.items({ orderBy: 'publishDate_DESC', first: 1 }, `{publishDate}`)
	);
	if (itemsQueryError) return console.log('itemsQueryError:', itemsQueryError);
	return items[0] ? items[0].publishDate : '2000-04-01T18:35+02:00';
}

function createTextContentObject(textContent) {
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

module.exports = addNewItems;
