export const removePTags = str => {
	return str.replace(/<p>|<\/p>/gi, '');
};
