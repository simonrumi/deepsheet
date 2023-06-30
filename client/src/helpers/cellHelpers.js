import * as R from 'ramda';
import managedStore from '../store';
import {
   indexToColumnLetter,
   indexToRowNumber,
   isSomething,
	isNothing,
   arrayContainsSomething,
   compareIndexValues,
	ifThen,
   ifThenElse,
	forLoopReduce,
	forLoopMap,
	getObjectFromArrayByKeyValue,
} from './index';
import {
	removeTypename,
	removeNamedKey,
   cellRow,
   cellColumn,
   cellText,
   cellSubsheetId,
   cellVisible,
   cellRowSetter,
   cellColumnSetter,
	cellContent,
	cellContentSetter,
   cellTextSetter,
	cellFormattedText,
	cellFormattedTextSetter,
	cellFormattedTextBlocks,
   cellSubsheetIdSetter,
   cellVisibleSetter,
	dbCells,
	dbTotalRows,
	dbTotalColumns,
   stateFocus,
   stateCellKeys,
   stateCell,
   statePresent,
   stateTotalColumns,
   stateColumnVisibility,
	stateRowVisibility,
   stateCellsUpdateInfo,
} from './dataStructureHelpers';
import {
   encodeFormattedText,
   decodeFormattedText,
   getFormattedText,
   cleanFormattedText,
   getCellPlainText,
   getRandomKey,
} from './richTextHelpers';
import { createCell } from './clipboardHelpers';
import { addCellReducers } from '../reducers/cellReducers';
import { addNewCellsToStore, addNewCellsToCellDbUpdates } from '../services/insertNewAxis';
import { updatedCell, hasChangedCell, addedCellKeys } from '../actions/cellActions';
import { updatedTotalRows, updatedTotalColumns, hasChangedMetadata, updatedRowHeight, updatedColumnWidth } from '../actions/metadataActions';
import { THIN_COLUMN, ROW_AXIS, COLUMN_AXIS, DEFAULT_ROW_HEIGHT, DEFAULT_COLUMN_WIDTH, LOG } from '../constants';
import { log } from '../clientLogger';

export const getCellContent = cell =>
   isSomething(cell) && isSomething(cell.content) && isSomething(cell.content.text) ? cell.content.text : '';

export const getRowNumFromObj = obj => (R.isNil(obj) ? null : R.has('row') ? obj.row : null);

export const getColNumFromObj = obj => (R.isNil(obj) ? null : R.has('column') ? obj.column : null);

//cellId is e.g. "B2"
export const createCellId = (rowIndex, columnIndex) =>
   R.concat(indexToColumnLetter(columnIndex), R.pipe(indexToRowNumber, R.toString)(rowIndex));

export const createCellKey = R.curry((rowIndex, columnIndex) => 'cell_' + rowIndex + '_' + columnIndex);

const getIndexFromCellKey = (axis, cellKey) => {
   const indexRegex = /cell_(\d+)_(\d+)/i;
   const matchArr = indexRegex.exec(cellKey); // returns e.g. ['cell_1_2', '1', '2'] where 1 is the row index and 2 is the column index
   return axis === ROW_AXIS ? parseInt(matchArr[1]) : parseInt(matchArr[2])
}

export const renderWholeRowGridSizingStyle = numCols => {
   const rowsStyle = 'repeat(1, 1.5em)';
   const columnsStyle = THIN_COLUMN + ' repeat(' + numCols + ', 1fr) ' + THIN_COLUMN;
   return {
      gridTemplateRows: rowsStyle,
      gridTemplateColumns: columnsStyle,
   };
};

// returns an object with only the cell's fields that are savable in the db
export const getSaveableCellData = cell =>
   R.pipe(
      cellRowSetter(cellRow(cell)),
      cellColumnSetter(cellColumn(cell)),
		cellFormattedTextSetter(cellFormattedText(cell)),
      cellSubsheetIdSetter(cellSubsheetId(cell)),
      cellVisibleSetter(cellVisible(cell)),
   )({});

export const isCellFocused = (cell, state) => {
   const currentlyFocused = stateFocus(state);
   return (
      R.hasPath(['cell'], currentlyFocused) &&
      currentlyFocused.cell?.row === cell?.row &&
      currentlyFocused.cell?.column === cell?.column
   );
};

export const getCellFromStore = ({row, column, state}) => R.pipe(
   createCellKey,
   stateCell(state)
)(row, column);

export const clearCells = state => R.pipe(
      stateCellKeys,
      managedStore.store.reducerManager.removeMany
   )(state);

export const getAllCells = state => R.pipe(
      stateCellKeys,
      R.map(cellKey => statePresent(state)[cellKey])
   )(state);

// when the cell reducer needs to update the cell, this creates the new state that the reducer returns
export const createUpdatedCellState = (payloadCell, state, sheetId) => {
	// note that payloadCell is like a propper cell with the sheetId prop added
   if (R.equals(sheetId, payloadCell.sheetId)) {
      return R.pipe(
            R.dissoc('sheetId'),
            R.append(R.__, [state]),
            R.append({isStale: false}), // at this point we have an array like [state, payloadCellWithoutSheetId, {isStale: false}]
            R.mergeAll //....so we merge all that to make the updated state
         )(payloadCell);
   }
   return state;
}

/***** ordering cells by row then column */
const filterToCurrentRow = R.curry((rowIndex, cells) => R.filter(cell => cell.row === rowIndex)(cells));
const sortByColumns = R.sortBy(cell => cell.column);

/**
 * makes sure at least one cell contains something
 */
const checkCells = cells => {
   if (!arrayContainsSomething(cells)) {
      return false;
   }
   return R.reduce(
      (accumulator, cell) => accumulator || isSomething(cell),
      false,
      cells
   );
}

export const orderCells = R.curry((totalRows, cells) => {
   if (!checkCells(cells)) {
      return [];
   }
   const buildSortedArr = (unsortedCells, sortedCells = [], currentRow = 0) => {
      const cellsSortedSoFar = R.pipe(
         filterToCurrentRow,
         sortByColumns,
         R.concat(sortedCells)
      )(currentRow, unsortedCells);
      return cellsSortedSoFar.length >= cells.length || currentRow >= totalRows 
         ? cellsSortedSoFar
         : buildSortedArr(unsortedCells, cellsSortedSoFar, currentRow + 1);
   };
   return R.pipe(
      R.sortBy(cell => cell.row),
      buildSortedArr
   )(cells);
});
/********/

const getAllCellReducerNames = R.map(cell => createCellKey(cell.row, cell.column))

export const removeAllCellReducers = () => R.pipe(
      managedStore.store.getState,
      getAllCells,
      getAllCellReducerNames,
      managedStore.store.reducerManager.removeMany,
      managedStore.store.replaceReducer
   )();

const getNextVisibleColumn = (columnIndex, goBackwards) => columnVisibilityArr => arrayContainsSomething(columnVisibilityArr)
   ? R.pipe(
      R.sort(compareIndexValues),
      sortedColumnVisibility => goBackwards 
         ? R.pipe(R.slice(0, columnIndex), R.reverse)(sortedColumnVisibility) // get the column indexes lower than the current one we're on, then reverse the order
         : R.slice(columnIndex + 1, Infinity)(sortedColumnVisibility), // get the column indexs higher than the current one we're on
      R.reduce(
         (accumulator, columnVisibility) => columnVisibility.isVisible ? R.reduced(columnVisibility.index) : accumulator, // when we find a visible column, return that index and finish
         columnIndex, // default value is the current column
      )
   )(columnVisibilityArr)
   : goBackwards 
      ? columnIndex === 0
         ? 0 // we're already at the first column, so stay where we are
         : columnIndex - 1
      : columnIndex === (stateTotalColumns(managedStore.state) - 1)
         ? columnIndex // we're already at the last column, so stay where we are
         : columnIndex + 1

export const tabToNextVisibleCell = (rowIndex, columnIndex, goBackwards) => R.pipe(
   stateColumnVisibility,
   getNextVisibleColumn(columnIndex, goBackwards),
   nextColumn => ifThenElse({
      ifCond: nextColumn !== columnIndex,
      thenDo: [
         createCellKey(rowIndex),
         cellKey => statePresent(managedStore.state)[cellKey]
      ],
      elseDo: () => null, // return null indicating that we are staying in the same cell
      params: { thenParams: nextColumn }
   })
)(managedStore.state);

export const haveCellsNeedingUpdate = state => R.pipe(
   stateCellsUpdateInfo,
   arrayContainsSomething,
)(state);
   
// not using this, but keeping since it could be useful
export const getCellKeysInAxis = (axis, axisIndex, state) => R.filter(
   cellKey => getIndexFromCellKey(axis, cellKey) === axisIndex, 
   stateCellKeys(state)
);

export const getCellsFromCellKeys = R.curry(
   (state, cellKeys) => R.map(cellKey => stateCell(state, cellKey), cellKeys)
);

export const encodeText = text => isSomething(text) ? text.replace(/([^a-zA-Z0-9\s])/g, '\\$1') : '';

const encodeCellText = cell => R.pipe(
      cellText, // TODO replace with getCellPlainText from richTextHelpers
      encodeText,
      cellTextSetter(R.__, cell),
		cell => ifThenElse({
			ifCond: R.pipe(cellFormattedText, isSomething),
			thenDo: [ cellFormattedText, encodeFormattedText, cellFormattedTextSetter(R.__, cell), ],
			elseDo: R.identity,
			params: { ifParams: cell, thenParams: cell, elseParams: cell }
		}),
   )(cell);

export const decodeText = text => {
	// first replace every char except \ 
	const unescapedChars = isSomething(text) ? text.replace(/\\[~`!@#$%^&*()_+={}[\]|;:'"<,>.?/-]/g, '') : '';
	// ...then reduce \\ to just \
	return unescapedChars.replace(/\\{2}([a-zA-Z0-9\s])/g, '\\$1');
}

export const decodeCellText = cell => R.pipe(
   cellText, // TODO replace with getCellPlainText from richTextHelpers
	decodeText,
	cellTextSetter(R.__, cell),
	cell => ifThenElse({
		ifCond: R.pipe(cellFormattedText, isSomething),
		thenDo: [ cellFormattedText, decodeFormattedText, cellFormattedTextSetter(R.__, cell), ],
		elseDo: R.identity,
		params: { ifParams: cell, thenParams: cell, elseParams: cell }
	})
)(cell);

export const removeCellFromArray = (cell, arr) => R.filter(
   cellFromArr => cell.row !== cellFromArr.row || cell.column !== cellFromArr.column, 
   arr
);

export const cellsInColumn = ({ state, columnIndex }) =>
   R.reduce(
      (accumulator, cell) => cellColumn(cell) === columnIndex 
         ? [...accumulator, cell] 
         : accumulator,
      [],
      getAllCells(state)
   );

export const cellsInRow = ({ state, rowIndex }) =>
   R.reduce(
      (accumulator, cell) => cellRow(cell) === rowIndex 
         ? [...accumulator, cell] 
         : accumulator,
      [],
      getAllCells(state)
   );

const removeDeprecatedTextField = cell => R.pipe(
	cellContent,
	R.omit(['text']),
	cellContentSetter(R.__, cell)
)(cell)

const tidyUpFormattedText = cell => R.pipe(
	cellFormattedText,
	removeTypename,
	removeNamedKey('placeholderString'),
	R.dissoc('entityMap'),
	removeNamedKey('data'),
	removeNamedKey('entityRanges'),
	cellFormattedTextSetter(R.__, cell),
)(cell);

export const prepCellsForDb = cells => R.map(
	R.pipe(
		encodeCellText,
		tidyUpFormattedText,
		removeDeprecatedTextField,
		cell => isSomething(R.prop('number', cell))
			? R.pick(['number', 'content', 'position'], cell)
			: R.pick(['row', 'column', 'visible', 'content'], cell), // leave out unnecessary fields, like isStale and __typename
	),
	cells // each call to R.pipe will be giving it a cell
);

export const ensureCorrectCellVisibility = R.curry((columnVisibility, rowVisibility, cell) => {
	const column = cellColumn(cell);
	const row = cellRow(cell);
	const currColumnFilter = getObjectFromArrayByKeyValue('index', column, columnVisibility);
	const currRowFilter = getObjectFromArrayByKeyValue('index', row, rowVisibility);
	const returnObj = { cell, updatedVisibility: false }; // we're mutating this....icky
	if (isNothing(cellVisible(cell))) {
		log({ level: LOG.VERBOSE }, 'cellHelpers--ensureCorrectCellVisibility cellVisible is nothing for cell', cell, 'so will update cell visibility');
		returnObj.cell = R.pipe(
			() => (currColumnFilter === true || isNothing(currColumnFilter)) && (currRowFilter === true || isNothing(currRowFilter))
				? true
				: false,
			cellVisibleSetter(R.__, cell),
		)();
		returnObj.updatedVisibility = true;
	}
	if (cellVisible(cell) === true && (currColumnFilter === false || currRowFilter === false)) {
		log({ level: LOG.VERBOSE }, 'cellHelpers--ensureCorrectCellVisibility cell visibility for cell', cell, 'is true but currColumnFilter is', currColumnFilter, 'currRowFilter', currRowFilter, 'so will update cell visibility');
		returnObj.cell = cellVisibleSetter(false, cell);
		returnObj.updatedVisibility = true;
	}
	if (cellVisible(cell) === false && (currColumnFilter === true || isNothing(currColumnFilter)) && (currRowFilter === true || isNothing(currRowFilter))) {
		log({ level: LOG.VERBOSE }, 'cellHelpers--ensureCorrectCellVisibility cell visibility for cell', cell, 'is false but currColumnFilter is', currColumnFilter, 'currRowFilter', currRowFilter, 'so will update cell visibility');
		returnObj.cell = cellVisibleSetter(true, cell);
		returnObj.updatedVisibility = true;
	}
	return returnObj;
});

export const maybeCorrectCellVisibility = () => {
	const columnVisibility = stateColumnVisibility(managedStore.state);
	const rowVisibility = stateRowVisibility(managedStore.state);
	R.forEach(cellKey => {
		const { cell, updatedVisibility } = R.pipe(
			stateCell(managedStore.state),
			ensureCorrectCellVisibility(columnVisibility, rowVisibility)
		)(cellKey);
		ifThen({
			ifCond: updatedVisibility,
			thenDo: [ 
				() => hasChangedCell({ row: cellRow(cell), column: cellColumn(cell) }), 
				() => updatedCell(cell),
			],
			params: { }
		});
	})(stateCellKeys(managedStore.state));
}

const addNewCellsAndCellKeysToStore = ({ newCells, newCellKeys }) => {
	if (!arrayContainsSomething(newCells) || !arrayContainsSomething(newCellKeys)) {
		return;
	}
	addCellReducers(newCells);
	addedCellKeys(newCellKeys);
	addNewCellsToStore(newCells);
	addNewCellsToCellDbUpdates(newCells);
}

// NOTE this is not functional coding style...would be nice to update
const tryIncreasingAxisCount = ({ totalinAxis, totalinOtherAxis, totalCellKeys }) => {
	let extra = 0;
	if ((totalinAxis + extra) * totalinOtherAxis === totalCellKeys) {
   	return { extra, perfectFit: true }
   }
	if ((totalinAxis + extra) * totalinOtherAxis > totalCellKeys) {
   	return { extra, perfectFit: false }
   }
	while((totalinAxis + extra) * totalinOtherAxis <= totalCellKeys) {
		++extra;
		if ((totalinAxis + extra) * totalinOtherAxis === totalCellKeys) {
			return { extra, perfectFit: true };
		}
		if ((totalinAxis + extra) * totalinOtherAxis > totalCellKeys) {
			return { extra, perfectFit: false };
		}
	}
	return { extra, perfectFit: false }
}

const concatRowWithAccumulator = ({ newRowCells, newRowCellKeys, accumulator }) => {
	if (!arrayContainsSomething(newRowCells) || !arrayContainsSomething(newRowCellKeys)) {
		return accumulator;
	}
	const newCells = R.pipe(R.prop('newCells'), R.concat(R.__, newRowCells))(accumulator);
	const newCellKeys = R.pipe(R.prop('newCellKeys'), R.concat(R.__, newRowCellKeys))(accumulator);
	return { newCells, newCellKeys };
}

const addCellToRowAccumulator = ({ rowAccumulator, cellKey, row, column }) => {
	const newRowCellKeys = R.pipe(R.prop, R.append(cellKey))('newRowCellKeys', rowAccumulator);
	const newCell = createCell({ text: '', rowIndex: row, columnIndex: column });
	const newRowCells = R.pipe(R.prop, R.append(newCell))('newRowCells', rowAccumulator);
	return { newRowCells, newRowCellKeys };
}

const addExtraRowsColumns = ({ newRows, newColumns, totalRows, totalColumns }) => {
	const lengths = { totalRows, totalColumns };
	const largestRowIndex = R.reduce((accumulator, index) => index > accumulator ? index : accumulator, 0, newRows);
	if (largestRowIndex >= totalRows) {
		lengths.totalRows = largestRowIndex + 1;
		updatedTotalRows({ newTotalRows: lengths.totalRows });
		hasChangedMetadata();
	}
	const largestColumnIndex = R.reduce((accumulator, index) => index > accumulator ? index : accumulator, 0, newColumns);
	if (largestColumnIndex >= totalColumns) {
		lengths.totalColumns = largestColumnIndex + 1;
		updatedTotalColumns({ newTotalColumns: lengths.totalColumns });
		hasChangedMetadata();
	}
	return lengths;
}

const checkEachCellHasAvailablePosition = sheet => {
	const totalRows = dbTotalRows(sheet);
	const totalColumns = dbTotalColumns(sheet);
	const cellKeys = stateCellKeys(managedStore.state);
	const { newRows, newColumns } = R.reduce(
		(accumulator, cellKey) => {
			const currentRowIndex = getIndexFromCellKey(ROW_AXIS, cellKey);
			if (currentRowIndex >= totalRows) {
				const foundIndexInNewRows = R.find(indexInNewRows => indexInNewRows === currentRowIndex, accumulator.newRows);
				if (!foundIndexInNewRows) {
					accumulator.newRows = R.append(currentRowIndex, accumulator.newRows);
				}
			}

			const currentColumnIndex = getIndexFromCellKey(COLUMN_AXIS, cellKey);
			if (currentColumnIndex >= totalColumns) {
				const foundIndexInNewColumns = R.find(indexInNewColumns => indexInNewColumns === currentColumnIndex, accumulator.newColumns);
				if (!foundIndexInNewColumns) {
					accumulator.newColumns = R.append(currentColumnIndex, accumulator.newColumns);
				}
			}
			return accumulator;
		},
		{ newRows: [], newColumns: [] },
		cellKeys
	);
	return addExtraRowsColumns({ newRows, newColumns, totalRows, totalColumns }); // this will return updated values for { totalRows, totalColumns }
}

const addExtraCells = ({ totalRows, totalColumns }) => {
	const { newCells, newCellKeys } = forLoopReduce(
		(accumulator, currentRow) => {
			const { newRowCells, newRowCellKeys } = forLoopReduce(
				(rowAccumulator, currentColumn) => {
					const cellKey = createCellKey(currentRow, currentColumn);
					const currentCell = stateCell(managedStore.state, cellKey);
					if (isNothing(currentCell)) {
						return addCellToRowAccumulator({ rowAccumulator, cellKey, row: currentRow, column: currentColumn });
					}
					return rowAccumulator;
				},
				{ newRowCells: [], newRowCellKeys: [] }, // initialValue
				totalColumns
			);
			return concatRowWithAccumulator({ newRowCells, newRowCellKeys, accumulator });
		},
		{ newCells: [], newCellKeys: [] }, // initial value
		totalRows
	);
	addNewCellsAndCellKeysToStore({ newCells, newCellKeys });
}

const addExtraAxisSizes = ({ axis, totalAxisItems, extraAxisItems }) => {
	const sizeUpdateFunction = axis === ROW_AXIS ? updatedRowHeight : updatedColumnWidth;
	const defaultSize = axis === ROW_AXIS ? DEFAULT_ROW_HEIGHT : DEFAULT_COLUMN_WIDTH;
	forLoopMap(
		currentIndex => sizeUpdateFunction((totalAxisItems + currentIndex + 1), defaultSize),
		extraAxisItems
	);
}

const increaseRowOrColumnCount = ({ totalRows, totalColumns, totalCellKeys }) => {
	// try increasing totalRows
	const { extra: extraRows, perfectFit: perfectRowFit } = tryIncreasingAxisCount({ totalinAxis: totalRows, totalinOtherAxis: totalColumns, totalCellKeys });
	if (perfectRowFit) {
		updatedTotalRows({ oldTotalRows: totalRows, newTotalRows: (totalRows + extraRows) });
		addExtraAxisSizes({ axis: ROW_AXIS, totalAxisItems: totalRows, extraAxisItems: extraRows });
		hasChangedMetadata();
		return;
	}
	// try increasing totalColumns
	const { extra: extraColumns, perfectFit: perfectColumnFit } = tryIncreasingAxisCount({ totalinAxis: totalColumns, totalinOtherAxis: totalRows, totalCellKeys });
	if (perfectColumnFit) {
		updatedTotalColumns({ oldTotalColumns: totalColumns, newTotalColumns: (totalColumns + extraColumns) });
		addExtraAxisSizes({ axis: COLUMN_AXIS, totalAxisItems: totalColumns, extraAxisItems: extraColumns });
		hasChangedMetadata();
		return;
	}
	// increase whichever axis requires the least number of added cells...and add the extra cells
	ifThenElse({
		ifCond: extraRows < extraColumns,
		thenDo: [
			() => updatedTotalRows({ oldTotalRows: totalRows, newTotalRows: (totalRows + extraRows) }),
			() => addExtraCells({ totalRows: (totalRows + extraRows), totalColumns })
		],
		elseDo: [
			() => updatedTotalColumns({ oldTotalColumns: totalColumns, newTotalColumns: (totalColumns + extraColumns) }),
			() => addExtraCells({ totalColumns: (totalColumns + extraColumns), totalRows })
		],
		params: {}
	});
}

const reconcileTotalCells = sheet => {
	const totalCellKeys = R.length(stateCellKeys(managedStore.state)) || 0;
	const { totalRows, totalColumns } = checkEachCellHasAvailablePosition(sheet);
	if (totalRows * totalColumns > totalCellKeys) {
		addExtraCells({ totalRows, totalColumns });
	}
	if (totalRows * totalColumns < totalCellKeys) {
		increaseRowOrColumnCount({ totalRows, totalColumns, totalCellKeys });
	}
}

export const addKeysToBlocks = cell => R.pipe(
	cellFormattedTextBlocks,
	R.map(
		block => R.prop('key', block) 
			? block 
			: R.pipe(
				getRandomKey,
				R.prop('key'),
				R.assoc('key', R.__, block)
			)({})
	),
	R.assoc('blocks', R.__, cellFormattedText(cell)),
	cellFormattedTextSetter(R.__, cell),
)(cell);

export const populateCellsInStore = sheet => {
	console.log('cellHelpers--populateCellsInStore got sheet:', sheet);
   R.pipe(
      dbCells,
		R.tap(data => console.log('cellHelpers--populateCellsInStore got dbCells', data)),
      R.map(cell => createCellKey(cell.row, cell.column)),
		R.tap(data => console.log('cellHelpers--populateCellsInStore created cell keys and will add them:', data)),
      addedCellKeys
   )(sheet);
   R.forEach(cell => 
		R.pipe(
			getFormattedText,
			decodeFormattedText,
			cellFormattedTextSetter(R.__, cell),
			R.tap(data => console.log('cellHelpers--populateCellsInStore will call updatedCell for this cell:', data)),
			updatedCell
		)(cell)
	)(dbCells(sheet));
	console.log('cellHelpers--populateCellsInStore will call reconcileTotalCells for sheet:', sheet);
	reconcileTotalCells(sheet);
}

export const cleanCell = cell => R.pipe(
	R.path(['content', 'formattedText']),
	cleanFormattedText,
	R.assocPath(['content', 'formattedText'], R.__, cell),
	removeTypename,
)(cell);

export const isTextInCell = ({ cell, text, isCaseSensitive, isRegex }) => {
	if (!arrayContainsSomething(cellFormattedTextBlocks(cell))) {
		return false;
	}
	const textRegex = isRegex ? text : new RegExp(text, isCaseSensitive ? '' : 'i');
	return R.pipe(
		getCellPlainText,
		cellPlainText => textRegex.test(cellPlainText)
	)(cell, false) // 2nd param is includeNewLineChars
}

export const isCellEmpty = cell => {
	if (!arrayContainsSomething(cellFormattedTextBlocks(cell))) {
		return true;
	}
	return R.pipe(
		getCellPlainText,
		cellPlainText => R.equals('', cellPlainText) || /^\s+$/.test(cellPlainText)
	)(cell, false) // 2nd param is includeNewLineChars
}

export const clearDeleteCellErrorMessages = state => {
	// TODO write this
	return true;	
}