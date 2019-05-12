function getUniqueAuthors(authors) {
	return [...new Set(authors)];
}

function getSlugFromUrl(url) {
	const splitUrl = url.split('/').filter((str) => str);
	return splitUrl[splitUrl.length - 1];
}

module.exports = {
	getUniqueAuthors,
	getSlugFromUrl,
};
