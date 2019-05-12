const _ = require('lodash');
const cheerio = require('cheerio');
const lgDummy = require('./lgDummy');
const { format } = require('date-fns');
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
} = require('../utils/scrapeHelpers');

const LG_BASE = 'https://www.livegamers.fi';
const lgRelativeUrl = relativeUrl(LG_BASE);
const getElementHref = fetchElemAttribute('href');
const getElementSrc = fetchElemAttribute('src');
const getElementStyle = fetchElemAttribute('style');

///////////////////////////////////////////////////////////////////////////////
// HELPER FUNCTIONS
///////////////////////////////////////////////////////////////////////////////

async function getLgNews() {
	const $ = await fetchHtmlFromUrl(lgRelativeUrl('uutiset')).catch((err) => {
		console.warn('fetchHtmlFromUrl error: ', err);
		return;
	});

	//const $ = cheerio.load(lgDummy);
	const itemsNodeList = $('.article-lift');
	const itemsPromise = Array.from(itemsNodeList).map(async (elem, i) => {
		return createItemObject(elem);
	});

	return await Promise.all(itemsPromise)
		.then((data) => {
			//console.log('lg-data: ', data);
			return data;
		})
		.catch((error) => {
			console.log('Error in parsing lg-items: ', error);
		});
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
	const { textContent, embeddedYoutubeLinks, embeddedTweets } = parseContent($);
	return {
		author,
		embeddedYoutubeLinks,
		embeddedTweets,
		textContent,
		publishDate,
		largeImg,
	};
}

function formatLGAuthor(author) {
	const splitIndex = author.indexOf(':') + 1;
	return author.substring(splitIndex, author.length - 1).trim();
}

function parseContent($) {
	const textContentList = Array.from($('.article-content > p'));
	const youtubeContentList = Array.from($('.framecontainer'));
	const tweetContentList = Array.from($('.article-content').find('.entry-content-asset'));

	const textContent = textContentList.reduce((contentArray, elem, i) => {
		const $ = cheerio.load(elem);
		if ($.text().trim().length === 0) {
			return contentArray;
		}

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

	const tweets = tweetContentList.map((tweet) => {
		const twt = cheerio.load(tweet);
		return getElementHref(twt('.twitter-tweet a:last-child'));
	});

	return {
		textContent,
		embeddedYoutubeLinks,
		embeddedTweets: tweets.filter((twt) => twt !== null),
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

module.exports = getLgNews;
