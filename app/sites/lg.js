const _ = require('lodash');
const cheerio = require('cheerio');

const {
	compose,
	composeAsync,
	extractNumber,
	enforceHttpsUrl,
	fetchHtmlFromUrl,
	extractFromElems,
	fromPairsToObject,
	fetchElemInnerText,
	fetchElemAttribute,
	extractUrlAttribute,
	relativeUrl,
	sanitizeNumber,
} = require('../helpers');

const LG_BASE = 'https://www.livegamers.fi';
const lgRelativeUrl = relativeUrl(LG_BASE);
const getElementHref = fetchElemAttribute('href');
const getElementSrc = fetchElemAttribute('src');

///////////////////////////////////////////////////////////////////////////////
// HELPER FUNCTIONS
///////////////////////////////////////////////////////////////////////////////

/**
A composed function that extracts a url from element attribute,
resolves it to the Scotch base url and returns the url with https
 **/
// const extractScotchUrlAttribute = (attr) =>
// 	compose(
// 		enforceHttpsUrl,
// 		scotchRelativeUrl,
// 		fetchElemAttribute(attr)
// 	);

async function getLgNews() {
	const $ = await fetchHtmlFromUrl(lgRelativeUrl('uutiset')).catch((err) =>
		console.warn('fetchHtmlFromUrl error: ', err)
	);
	const news = $('.article-lift');
	const newsItems = Array.from(news).map(async (elem, i) => {
		if (i === 2) return await createItemObject(elem);
	});

	console.log(
		Promise.all(newsItems).then((data) => {
			//console.log('promise.all data: ', data);
		})
	);
}

async function createItemObject(elem) {
	const $ = cheerio.load(elem);
	const titleDescriptionLink = getTitleDescriptionLink($);
	const smallImg = getSmallImg($);
	const authorContentDateImg = await getAuthorContentDateImg(titleDescriptionLink.url);
	return { ...titleDescriptionLink, ...smallImg, ...authorContentDateImg };
}

function getTitleDescriptionLink($) {
	const target = $('.article-lift__text-content');
	const title = target.find('> a > h4').text();
	const description = target.find('> p').text();
	const relativeLinkUrl = getElementHref(target.find('> a'));
	const completeLinkUrl = lgRelativeUrl(
		relativeLinkUrl ? relativeLinkUrl.substring(1) : ''
	);

	return {
		title,
		description,
		url: completeLinkUrl,
	};
}

function getSmallImg($) {
	const target = $('.article-lift__image-content');
	return {
		smallImgUrl: getElementSrc(target.find('img')),
	};
}

async function getAuthorContentDateImg(newsUrl) {
	const $ = await fetchHtmlFromUrl(newsUrl);
	const publishDate = $("meta[property='article:modified_time']").attr('content');
	const author = formatLGAuthor(fetchElemInnerText($('.hero-area > h4').first()));
	//const largeImg = .hero-area-elementin backgroundissa on kuva --> style="background-image: url('https://www.livegamers.fi/app/uploads/BFFirestorm-1080x500.jpg')"
	const content = parseContent($);
	return { author, content, publishDate };
}

function formatLGAuthor(author) {
	const splitIndex = author.indexOf(':') + 1;
	return author.substring(splitIndex, author.length - 1).trim();
}

function parseContent($) {
	const textContentList = Array.from($('.article-content p'));
	const youtubeContentList = Array.from($('.framecontainer'));
	const textContent = textContentList.reduce((contentArray, elem, i) => {
		const $ = cheerio.load(elem);
		return contentArray.concat({
			text: $.text(),
			link: getElementHref($('a')),
		});
	}, []);

	const embeddedYoutubeLinks = youtubeContentList.map((elem, i) => {
		const $ = cheerio.load(elem);
		return getElementSrc($('iframe'));
	});

	return {
		textContent,
		embeddedYoutubeLinks,
	};
}
module.exports = getLgNews;
