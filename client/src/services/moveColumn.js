import * as R from 'ramda';
import { forLoopReduce } from '../helpers';
import { createCellKey } from '../helpers/cellHelpers';
import { getAxisVisibilityName, getAxisFilterName } from '../helpers/visibilityHelpers';
import {
	makeNewSheetObjectFromMap,
	buildObject,
	reorderIndicies,
	createOptimizedMappingFromArray,
	createMappingFromArray,
} from './moveAxis';
import { COLUMN_AXIS } from '../constants';

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
