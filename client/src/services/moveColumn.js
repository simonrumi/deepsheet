import * as R from 'ramda';
import { forLoopMap, forLoopReduce, mapWithIndex, reduceWithIndex } from '../helpers';
import { createCellKey } from '../helpers/cellHelpers';
import { getAxisVisibilityName, getAxisFilterName } from '../helpers/visibilityHelpers';
import { COLUMN_AXIS } from '../constants';

const makeNewSheetObjectFromMap = R.curry((columnUpdateMapping, sheet, objectName) =>
	R.reduce(
		(accumulator, columnMap) => {
			const movedToIndex = columnMap[0];
			const movedFromIndex = columnMap[1];
			if (R.has(movedFromIndex, sheet[objectName])) {
				return R.assoc(movedToIndex, sheet[objectName][movedFromIndex], accumulator);
			}
			return accumulator;
		},
		{},
		columnUpdateMapping
	)
);

const createArray = (...args) => [...args];

const buildObject = R.pipe(
	createArray,
	R.mergeAll
);

const makeNewCellsFromMap = (columnUpdateMapping, state) => {
	const getCellFromState = R.pipe(
		createCellKey,
		R.prop(R.__, state)
	);

	const createCells = R.reduce((newCells, columnMapping) => {
		const columnIndex = columnMapping[0]; // this is the column that we are going to reconstruct
		const movedColumnIndex = columnMapping[1]; // this is the column that we are getting the content (and other stuff) from
		newCells = forLoopReduce(
			(accumulator, rowIndex) =>
				R.pipe(
					buildObject, // builds a cell based on the cell in the column being moved, but with the index of the destination column
					R.assoc(createCellKey(rowIndex, columnIndex), R.__, accumulator) // puts the cell in the newCells object (the accumulator)
				)(getCellFromState(rowIndex, movedColumnIndex), R.assoc('column', columnIndex, {})), // params for buildObject
			newCells,
			state.sheet.totalRows
		);
		return newCells;
	}, {});
	return createCells(columnUpdateMapping);
};

const reorderIndicies = (columnIndexToMove, insertAfterIndex, totalColumns) => {
	const initialArray = forLoopMap(index => index, totalColumns);
	if (columnIndexToMove < insertAfterIndex) {
		const newFirstPart = R.slice(0, columnIndexToMove, initialArray); // less than columnIndexToMove is untouched
		const newSecondPart = R.slice(columnIndexToMove + 1, insertAfterIndex + 1, initialArray); // from columnIndexToMove to insertIndex will be moved 1 closer to start
		// columnIndexToMove goes after the newSecondPart in the final array
		const newEndPart = R.slice(insertAfterIndex + 1, totalColumns, initialArray); // greater than insertIndex is untouched
		return R.pipe(
			R.concat,
			R.concat(R.__, [columnIndexToMove]),
			R.concat(R.__, newEndPart)
		)(newFirstPart, newSecondPart);
	}

	if (columnIndexToMove > insertAfterIndex) {
		const newFirstPart = R.slice(0, insertAfterIndex + 1, initialArray); // up to insertAfterIndex is untouched
		// columnIndexToMove goes here
		const newThirdPart = R.slice(insertAfterIndex + 1, columnIndexToMove, initialArray); // from insertAfterIndex + 1 to columnIndexToMove - 1 will be moved 1 closer to end
		const newEndPart = R.slice(columnIndexToMove + 1, totalColumns, initialArray); // greater than columnIndexToMove is untouched
		return R.pipe(
			R.concat,
			R.concat(R.__, newThirdPart),
			R.concat(R.__, newEndPart)
		)(newFirstPart, [columnIndexToMove]);
	}
};

const createOptimizedMappingFromArray = reduceWithIndex(
	(accumulator, value, index) => (value === index ? accumulator : R.append([index, value], accumulator)),
	[]
);

const createMappingFromArray = mapWithIndex((value, index) => [index, value]);

export default state => {
	const columnIndexToMove = state.sheet.columnMoved;
	const insertBelowIndex = state.sheet.columnMovedTo;
	const totalColumns = state.sheet.totalColumns;

	const reorderedIndicies = reorderIndicies(columnIndexToMove, insertBelowIndex, totalColumns);

	const newCells = R.pipe(
		createOptimizedMappingFromArray,
		makeNewCellsFromMap(R.__, state)
	)(reorderedIndicies);

	const columnUpdateArr = createMappingFromArray(reorderedIndicies);

	const makeNewSheetObjFromNameFn = nameFn =>
		R.pipe(
			nameFn,
			makeNewSheetObjectFromMap(columnUpdateArr, state.sheet)
		)(COLUMN_AXIS);

	const newColumnFilters = makeNewSheetObjFromNameFn(getAxisFilterName);
	const newColumnVisibility = makeNewSheetObjFromNameFn(getAxisVisibilityName);
	const hasChanged = true;
	return [newCells, newColumnFilters, newColumnVisibility, hasChanged];
};
