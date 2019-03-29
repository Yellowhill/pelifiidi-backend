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
} = require('../utils/helpers');

const LG_BASE = 'https://www.livegamers.fi';
const lgRelativeUrl = relativeUrl(LG_BASE);
const getElementHref = fetchElemAttribute('href');
const getElementSrc = fetchElemAttribute('src');
const getElementStyle = fetchElemAttribute('style');

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

	// console.log(
	// 	Promise.all(newsItems).then((data) => {
	// 		console.log('promise.all data: ', data);
	// 	})
	// );
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
		smallImg: getElementSrc(target.find('img')),
	};
}

async function getAuthorContentDateImg(newsUrl) {
	const $ = await fetchHtmlFromUrl(newsUrl);
	const publishDate = $("meta[property='article:modified_time']").attr('content');
	const author = formatLGAuthor(fetchElemInnerText($('.hero-area > h4').first()));
	const styleString = getElementStyle($('.hero-area'));
	const largeImg = styleString ? styleString.split("'")[1] : '';
	const { textContent, embeddedYoutubeLinks } = parseContent($);
	return { author, embeddedYoutubeLinks, textContent, publishDate, largeImg };
}

function formatLGAuthor(author) {
	const splitIndex = author.indexOf(':') + 1;
	return author.substring(splitIndex, author.length - 1).trim();
}

function parseContent($) {
	const textContentList = Array.from($('.article-content p'));
	const youtubeContentList = Array.from($('.framecontainer'));
	const textContent = textContentList.reduce((contentArray, elem, i) => {
		const $ = cheerio.load(diu);

		const inlineLinks = $('a').length > 0 ? getInlineLinkMappings($) : [];

		return contentArray.concat({
			text: $.text(),
			inlineLinks,
		});
	}, []);

	const embeddedYoutubeLinks = youtubeContentList.map((elem, i) => {
		const $ = cheerio.load(elem);
		return getElementSrc($('iframe'));
	});

	return {
		textContent: JSON.stringify(textContent),
		embeddedYoutubeLinks,
	};
}

function getInlineLinkMappings(pTag) {
	return Array.from(pTag('a')).map((elem) => {
		const anchor = cheerio.load(elem);
		const linkText = anchor('a').text();
		const linkUrl = getElementHref(anchor('a'));
		return { text: linkText, url: linkUrl };
	});
}

const diu =
	'<p> Se selviää <a href="https://www.livegamers.fi/arvostelut/resident-evil-2/">arvostelustamme</a> tai <a href="https://www.livegamers.fi/arvostelut/resident-evil-2-2">paskastamme</a>!</p>';

module.exports = getLgNews;
