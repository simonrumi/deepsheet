import * as R from 'ramda';
import { forLoopMap, forLoopReduce, mapWithIndex, reduceWithIndex } from '../helpers';
import { createCellKey } from '../helpers/cellHelpers';
import { getAxisVisibilityName, getAxisFilterName } from '../helpers/visibilityHelpers';
import { ROW_AXIS } from '../constants';

const makeNewSheetObjectFromMap = R.curry((rowUpdateMapping, sheet, objectName) =>
	R.reduce(
		(accumulator, rowMap) => {
			const movedToIndex = rowMap[0];
			const movedFromIndex = rowMap[1];
			if (R.has(movedFromIndex, sheet[objectName])) {
				return R.assoc(movedToIndex, sheet[objectName][movedFromIndex], accumulator);
			}
			return accumulator;
		},
		{},
		rowUpdateMapping
	)
);

const createArray = (...args) => [...args];

const buildObject = R.pipe(
	createArray,
	R.mergeAll
);

const makeNewCellsFromMap = (rowUpdateMapping, state) => {
	const getCellFromState = R.pipe(
		createCellKey,
		R.prop(R.__, state)
	);

	const createCells = R.reduce((newCells, rowMapping) => {
		const rowIndex = rowMapping[0]; // this is the row that we are going to reconstruct
		const movedRowIndex = rowMapping[1]; // this is the row that we are getting the content (and other stuff) from
		newCells = forLoopReduce(
			(accumulator, columnIndex) =>
				R.pipe(
					buildObject, // builds a cell based on the cell in the row being moved, but with the index of the destination row
					R.assoc(createCellKey(rowIndex, columnIndex), R.__, accumulator) // puts the cell in the newCells object (the accumulator)
				)(getCellFromState(movedRowIndex, columnIndex), R.assoc('row', rowIndex, {})), // params for buildObject
			newCells,
			state.sheet.totalColumns
		);
		return newCells;
	}, {});
	return createCells(rowUpdateMapping);
};

const reorderIndicies = (rowIndexToMove, insertAfterIndex, totalRows) => {
	const initialArray = forLoopMap(index => index, totalRows);
	if (rowIndexToMove < insertAfterIndex) {
		const newFirstPart = R.slice(0, rowIndexToMove, initialArray); // less than rowIndexToMove is untouched
		const newSecondPart = R.slice(rowIndexToMove + 1, insertAfterIndex + 1, initialArray); // from rowIndexToMove to insertIndex will be moved 1 closer to start
		// rowIndexToMove goes after the newSecondPart in the final array
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

const createOptimizedMappingFromArray = reduceWithIndex(
	(accumulator, value, index) => (value === index ? accumulator : R.append([index, value], accumulator)),
	[]
);

const createMappingFromArray = mapWithIndex((value, index) => [index, value]);

export default state => {
	const rowIndexToMove = state.sheet.rowMoved;
	const insertBelowIndex = state.sheet.rowMovedTo;
	const totalRows = state.sheet.totalRows;

	const reorderedIndicies = reorderIndicies(rowIndexToMove, insertBelowIndex, totalRows);

	const newCells = R.pipe(
		createOptimizedMappingFromArray,
		makeNewCellsFromMap(R.__, state)
	)(reorderedIndicies);

	const rowUpdateArr = createMappingFromArray(reorderedIndicies);

	const makeNewSheetObjFromNameFn = nameFn =>
		R.pipe(
			nameFn,
			makeNewSheetObjectFromMap(rowUpdateArr, state.sheet)
		)(ROW_AXIS);

	const newRowFilters = makeNewSheetObjFromNameFn(getAxisFilterName);
	const newRowVisibility = makeNewSheetObjFromNameFn(getAxisVisibilityName);
	const hasChanged = true;
	return [newCells, newRowFilters, newRowVisibility, hasChanged];
};
