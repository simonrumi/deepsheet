import * as R from 'ramda';
import { forLoopReduce, reduceWithIndex } from '../helpers';
import { createCellKey } from '../helpers/cellHelpers';

const createArrayOfNums = length => {
	const arr = new Array(length);
	for (let i = 0; i < length; i++) {
		arr[i] = i;
	}
	return arr;
};

const mapOldIndicesToNewIndicies = (rowIndexToMove, insertAfterIndex, totalRows) => {
	const initialArray = createArrayOfNums(totalRows);
	if (rowIndexToMove < insertAfterIndex) {
		const newFirstPart = R.slice(0, rowIndexToMove, initialArray); // less than rowIndexToMove is untouched
		const newSecondPart = R.slice(rowIndexToMove + 1, insertAfterIndex + 1, initialArray); // from rowIndexToMove to insertIndex will be moved 1 closer to start
		// rowIndexToMove goes here
		const newEndPart = R.slice(insertAfterIndex + 1, totalRows, initialArray); // greater than insertIndex is untouched
		return R.pipe(
			R.concat,
			R.concat(R.__, [rowIndexToMove]),
			R.concat(R.__, newEndPart)
		)(newFirstPart, newSecondPart);
	}

	if (rowIndexToMove > insertAfterIndex) {
		const newFirstPart = R.slice(0, insertAfterIndex + 1, initialArray); // up to insertAfterIndex is untouched
		// rowIndexToMove goes here
		const newThirdPart = R.slice(insertAfterIndex + 1, rowIndexToMove, initialArray); // from insertAfterIndex + 1 to rowIndexToMove - 1 will be moved 1 closer to end
		const newEndPart = R.slice(rowIndexToMove + 1, totalRows, initialArray); // greater than rowIndexToMove is untouched
		return R.pipe(
			R.concat,
			R.concat(R.__, newThirdPart),
			R.concat(R.__, newEndPart)
		)(newFirstPart, [rowIndexToMove]);
	}
};

const createArray = (...args) => [...args];

const buildObject = R.pipe(
	createArray,
	R.mergeAll
);

const makeNewCellsFromMap = (rowUpdateArr, state) => {
	const removeUnmovedEntries = reduceWithIndex(
		(accumulator, value, index) => (value === index ? accumulator : R.append([index, value], accumulator)),
		[]
	);
	const optimizedUpdateArr = removeUnmovedEntries(rowUpdateArr);

	const getCellFromState = R.pipe(
		createCellKey,
		R.prop(R.__, state)
	);

	const createCells = R.reduce((updatedCells, rowMapping) => {
		const rowIndex = rowMapping[0]; // this is the row that we are going to reconstruct
		const movedRowIndex = rowMapping[1]; // this is the row that we are getting the content (and other stuff) from
		updatedCells = forLoopReduce(
			(accumulator, columnIndex) =>
				R.pipe(
					buildObject, // builds a cell based on the cell in the row being moved, but with the index of the destination row
					R.assoc(createCellKey(rowIndex, columnIndex), R.__, accumulator) // puts the cell in the updatedCells object
				)(getCellFromState(movedRowIndex, columnIndex), R.assoc('row', rowIndex, {})), // params for buildObject
			updatedCells,
			state.sheet.totalColumns
		);
		console.log('createCells, updatedCells = ', updatedCells);
		return updatedCells;
	}, {});
	return createCells(optimizedUpdateArr);
};

const moveRowContent = (rowIndexToMove, insertBelowIndex, totalRows, state) => {
	const rowUpdateArr = mapOldIndicesToNewIndicies(rowIndexToMove, insertBelowIndex, totalRows);

	// TODO
	// update the rowFilters according to the map
	// update the rowVisibility according to the map

	console.log('moveRowContent: rowUpdateArr', rowUpdateArr);
	const updatedCells = makeNewCellsFromMap(rowUpdateArr, state);
	return updatedCells;
};

export default state => {
	if (state.sheet.rowMoved === state.sheet.rowMovedTo) {
		return null;
	}
	const stateUpdates = moveRowContent(state.sheet.rowMoved, state.sheet.rowMovedTo, state.sheet.totalRows, state);
	console.log('moveRowContent returned', stateUpdates); /// for a first test just console log out the array of new indices
	// TODO updateVisibility(sheet); // probably need to recalculate whole sheet visibility

	return stateUpdates;
};
