const _ = require('lodash');
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
} = require('../helpers');

const LG_BASE = 'https://www.livegamers.fi';
const lgRelativeUrl = relativeUrl(LG_BASE);
///////////////////////////////////////////////////////////////////////////////
// HELPER FUNCTIONS
///////////////////////////////////////////////////////////////////////////////

/**
A composed function that extracts a url from element attribute,
resolves it to the Scotch base url and returns the url with https
 **/
const extractScotchUrlAttribute = (attr) =>
	compose(
		enforceHttpsUrl,
		scotchRelativeUrl,
		fetchElemAttribute(attr)
	);

async function getLgNews() {
	const $ = await fetchHtmlFromUrl(lgRelativeUrl('uutiset'));
	const diu = $('.article-lift');
	/*lista elementtejä, looppaa läpi, luo objekti: {title, img, href, describtion }*/
	console.log('diu1: ', diu);
	//extractFromElems;
	console.log('diu', fetchElemInnerText($('h2.section-title')));
}
module.exports = getLgNews;
