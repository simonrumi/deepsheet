import * as R from 'ramda';
import ReactDOM from 'react-dom';
import managedStore from '../store';
import { updatedSheetId } from '../actions';
import { ROW_AXIS, COLUMN_AXIS } from '../constants';

// temp fake data
import mockSheet from '../mockSheet2';
import mockSubSheet from '../mockSubSheet';

export const nothing = () => null;

const makeArr = length => new Array(length);
export const mapWithIndex = R.addIndex(R.map);

// when you want to map, but you don't have an array, just a number of times to run the function supplied to map
// the function gets the index as a param each time
// returns an array
export const forLoopMap = (fn, length) => mapWithIndex((val, index) => fn(index), makeArr(length));

export const reduceWithIndex = R.addIndex(R.reduce);

// when you want to reduce, but you don't have an array, just a number of times to run the function supplied to reduce
// the function gets the params (accumulator, index)
// returns the final result collected by the accumulator
export const forLoopReduce = (fn, initialVal, length) =>
	reduceWithIndex((accumulator, value, index) => fn(accumulator, index), initialVal, makeArr(length));

export const capitalizeFirst = R.pipe(
	R.head,
	R.toUpper
);

export const capitalCase = R.converge(R.concat, [
	capitalizeFirst,
	R.pipe(
		R.tail,
		R.toLower
	),
]);

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
	return parseInt(index, 10) + 1;
};

export const fetchSheet = id => {
	// very temporary - returning fake data
	// real version will need to get this from the database
	if (id === 1) {
		return mockSheet;
	}
	if (id === 2) {
		return mockSubSheet;
	}
};

export const fetchSummaryCellFromSheet = sheetId => {
	// the idea here is to use the database to look up the sheet with the given sheetId and return the content of the
	// cell designated as the summaryCell
	// however for the moment we'll just return some fake data
	if (sheetId === 2) {
		return 'summary of sheet with id 2';
	}
	return null;
};

export const extractRowColFromCellKey = str => {
	// expecting a string like some_prefix_2_3
	//where 2 & 3 are the row and column numbers respectively
	const regex = new RegExp(/.*_(\d+)_(\d+)$/);
	const matchArr = regex.exec(str);
	if (!matchArr || matchArr.length < 3) {
		return;
	}
	const row = parseInt(matchArr[1]);
	const column = parseInt(matchArr[2]);
	const rowColObj = {};
	rowColObj[ROW_AXIS] = row;
	rowColObj[COLUMN_AXIS] = column;
	return rowColObj;
};

export const loadSheet = async sheetId => {
	// first clear out the cell reducers from any previosly loaded sheet
	const newCombinedReducers = managedStore.store.reducerManager.removeMany(managedStore.state.cellKeys);
	managedStore.store.replaceReducer(newCombinedReducers);
	// then get the new sheet
	updatedSheetId(sheetId);
};

// TODO: dont; think this is used...check and delete if so
export const unmountAllCells = cellKeys => {
	R.map(cellKey => ReactDOM.unmountComponentAtNode(document.getElementById(cellKey)), cellKeys);
};

// impure function to help with debugging
export const trace = R.curry((tag, x) => {
	console.log(tag, x);
	return x;
});
