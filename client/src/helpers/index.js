export const removePTags = str => {
	return str.replace(/<p>|<\/p>/gi, '');
};

export const indexToColumnLetter = index => {
	if (index > 26 * 26 + 25) {
		// 701 is column ZZ...who's going to have more columns than that??
		throw new Error('Maximum number of columns exceeded');
	}
	const UPPERCASE_START_CODE = 65;
	const unitSquaredValue = Math.floor(index / 26);
	const unitValue = index % 26;
	let columnLetter = '';
	if (unitSquaredValue) {
		// note that the unitSquaredValue will indicate e.g. 1 when it means "A"
		// so we need to subtract 1 to make it zero-based, and then add the UPPERCASE_START_CODE
		columnLetter = String.fromCharCode(unitSquaredValue - 1 + UPPERCASE_START_CODE);
	}
	columnLetter += String.fromCharCode(unitValue + UPPERCASE_START_CODE);
	return columnLetter;
};

export const indexToRowNumber = index => {
	return index + 1;
};
