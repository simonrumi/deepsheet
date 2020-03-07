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
import { ROW_AXIS } from '../constants';

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
