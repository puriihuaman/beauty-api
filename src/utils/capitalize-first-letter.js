const capitalizeFirstLetter = (text) => {
	const cleanText = text.trim();
	return cleanText
		.split(" ")
		.map((el) => el.charAt(0).toUpperCase().concat(el.slice(1)))
		.join(" ");
};

module.exports = { capitalizeFirstLetter };
