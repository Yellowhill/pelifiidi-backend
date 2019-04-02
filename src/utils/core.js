function getUniqueAuthors(authors) {
	return [...new Set(authors)];
}

module.exports = {
	getUniqueAuthors,
};
