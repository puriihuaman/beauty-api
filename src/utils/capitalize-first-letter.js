const capitalizeFirstLetter = (text) => {
	const cleanText = text.trim();
	return cleanText.charAt(0).toUpperCase().concat(cleanText.slice(1));
};

module.exports = { capitalizeFirstLetter };
