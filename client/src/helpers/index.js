import mockSheet from '../mockSheet2'; // temp fake data

export const removePTags = str => {
	return str.replace(/<p>|<\/p>/gi, '');
};

export const indexToColumnLetter = index => {
	let num = index + 1; // counting from 1, A = 1, Z = 26
	const getPlaceValue = (num, placeValues = []) => {
		const BASE = 26;
		let remainder = num % BASE;
		let quotient = Math.floor(num / BASE);
		if (remainder === 0) {
			// quirk of the lettering system is that there is no equivalent of zero
			// ie there is no equivalent of  the decimal "10" because we have "AA"
			// instead of "A0". So these 2 lines do the equivalent of skipping from
			// "9" to "11"
			remainder = BASE;
			quotient = quotient - 1;
		}
		if (quotient === 0) {
			return [remainder, ...placeValues];
		}
		return getPlaceValue(quotient, [remainder, ...placeValues]);
	};
	const placeValues = getPlaceValue(num);

	const UPPERCASE_CODE_OFFSET = 64; // 65 is "A" but we want to add to map to "A"
	const columnLetters = placeValues.reduce((accumulator, currentValue) => {
		return accumulator + String.fromCharCode(currentValue + UPPERCASE_CODE_OFFSET);
	}, '');
	return columnLetters;
};

export const indexToRowNumber = index => {
	return index + 1;
};

export const fetchSheet = () => {
	return mockSheet;
};
