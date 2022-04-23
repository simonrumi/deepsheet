import * as R from 'ramda';
import managedStore from '../store';
import {
   isNothing,
   isSomething,
   compareIndexValues,
   forLoopReduce,
   reduceWithIndex,
   ifThenElse,
   ifThen, 
   arrayContainsSomething,
   getObjectFromArrayByKeyValue,
} from '.';
import { isRowDirectionForward, isColumnDirectionForward } from './rangeToolHelpers';
import { orderFromAndToAxes } from './rangeToolHelpers';
import { createCellKey } from './cellHelpers';
import { 
    statePresent,
    stateCellRangeCells,
    stateCellRangeFrom,
    stateCellRangeTo,
    cellColumn,
    cellRow,
    cellText,
    cellSubsheetId,
    cellRowSetter,
    cellColumnSetter,
    cellTextSetter,
	 cellVisible,
    cellVisibleSetter,
    stateTotalRows,
    stateTotalColumns,
    stateColumnVisibility,
    stateRowVisibility,
	 stateSystemClipboard,
} from './dataStructureHelpers';
import { updatedCell, hasChangedCell } from '../actions/cellActions';
import { updatedClipboardError } from '../actions/clipboardActions';
import { capturedSystemClipboard } from '../actions/pasteOptionsModalActions';
import { updatedMetadataErrorMessage } from '../actions/metadataActions';
import insertNewColumns from '../services/insertNewColumns';
import insertNewRows from '../services/insertNewRows';
import { cellRangePasteError, SYSTEM_CLIPBOARD_UNAVAILABLE_MSG } from '../components/displayText';
import { ROW_AXIS, COLUMN_AXIS, LOG } from '../constants';
import { log } from '../clientLogger';

const createPlaceholderCell = (row, column) => R.pipe(
        cellRowSetter(row),
        cellColumnSetter(column),
        cellTextSetter(''),
        cellVisibleSetter(true),
    )({});

const sortVisibilityArr = R.sort((visibilityItem1, visibilityItem2) => 
    visibilityItem1.index === visibilityItem2
        ? 0
        : visibilityItem1.index > visibilityItem2.index
            ? 1
            : -1
);

const populateAndSortVisibilityArr = (visibilityArr, axis) => R.pipe(
    axis => axis === ROW_AXIS ? stateTotalRows(managedStore.state) : stateTotalColumns(managedStore.state), // the total row/columns will be the number of times to go thru the forLoopReduce
    forLoopReduce(
        (accumulator, index) => {
            const visibilityItem = getObjectFromArrayByKeyValue('index', index, visibilityArr);
            return isNothing(visibilityItem)
                ? R.append({ index, isVisible: true }, accumulator) // add in a visibility item if it isn't there already
                : R.append(visibilityItem, accumulator);
        },
        [] // accumulator initially empty
    ),
    sortVisibilityArr
)(axis);

const adjustIndiciesArrToShape = ({ lengthNeeded, indiciesArr, axis }) => indiciesArr.length === lengthNeeded
    ? indiciesArr // it is exactly the right length, so just leave the indiciesArr as is
    : ifThenElse({
        ifCond: lengthNeeded - indiciesArr.length > 0, // if +ve we need to add indicides, if -ve we need to remove
        thenDo: () => {
            const firstAdditionalIndex = axis === ROW_AXIS ? stateTotalRows(managedStore.state) : stateTotalColumns(managedStore.state);
            return forLoopReduce(
                (accumulator, index) => R.append(firstAdditionalIndex + index, accumulator),
                indiciesArr,
                lengthNeeded - indiciesArr.length // number of indices to add
            );
        },
        elseDo: () => R.slice(0, lengthNeeded, indiciesArr),
        params: {}
    });

const getTargetCell = (rowIndex, columnIndex) => {
    return R.pipe(
        createCellKey,
        R.prop(R.__, statePresent(managedStore.state)), // uses the cellKey to get the targetCell from the store
        maybeTargetCell => isSomething(maybeTargetCell)
            ? maybeTargetCell
            : createPlaceholderCell(rowIndex, columnIndex)
    )(rowIndex, columnIndex);
}

const getHiddenAxisItemsCount = (fromIndex, axis) => {
    const visibilityArr = axis === ROW_AXIS ? stateRowVisibility(managedStore.state) : stateColumnVisibility(managedStore.state);
    if (isNothing(visibilityArr)) {
        return 0;
    }
    return R.reduce((count, visibilityItem) => visibilityItem.index >= fromIndex && !visibilityItem.isVisible
        ? count + 1
        : count,
        0, // initial value of the count
        visibilityArr
    );
}

const getVisibleAxisIndicies = (startingIndex, axis) => {
    const visibilityArr = axis === ROW_AXIS ? stateRowVisibility(managedStore.state) : stateColumnVisibility(managedStore.state);
    return R.pipe(
        populateAndSortVisibilityArr,
        R.reduce(
            (accumulator, visibilityItem) => visibilityItem.index >= startingIndex && visibilityItem.isVisible
                ? R.append(visibilityItem.index, accumulator)
                : accumulator,
            [], // will hold array of visible indicies
        ),
    )(visibilityArr, axis);
}

const getExtraSpaceNeeded = (startCellRowIndex, startCellColumnIndex, rangeShape) => {
    const hiddenColumnCount = getHiddenAxisItemsCount(startCellColumnIndex, COLUMN_AXIS);
    const hiddenRowCount = getHiddenAxisItemsCount(startCellRowIndex, ROW_AXIS);
    const extraRows = startCellRowIndex + rangeShape.rowSpan + hiddenRowCount - stateTotalRows(managedStore.state);
    const extraColumns = startCellColumnIndex + rangeShape.columnSpan + hiddenColumnCount - stateTotalColumns(managedStore.state);
    return [
        extraRows > 0 ? extraRows : 0,
        extraColumns >  0 ? extraColumns : 0
    ]
}

const orderVisibleClipboardCells = () => R.pipe(
	stateCellRangeCells, 
	R.tap(data => console.log('clipboardHelpers--orderVisibleClipboardCells after stateCellRangeCells got', data)),
	R.sort(compareIndexValues),
	R.tap(data => console.log('clipboardHelpers--orderVisibleClipboardCells after sort got', data)),
	R.filter(cell => cellVisible(cell)),
	R.tap(data => console.log('clipboardHelpers--orderVisibleClipboardCells after filter got', data)),
)(managedStore.state);

const registerUpdatedCells = targetMap => R.forEach(
        ([ sourceCell, targetCell ]) => hasChangedCell({ row: cellRow(targetCell), column: cellColumn(targetCell) }),
        targetMap
    );

const pasteToTargetCells = targetMap => R.forEach(
    ([ sourceCell, targetCell ]) => R.pipe(
        cellRowSetter(cellRow(targetCell)),
        cellColumnSetter(cellColumn(targetCell)),
        updatedCell
    )(sourceCell), // start with the sourceCell object, but update the row and column to that of the targetCell
    targetMap
);

const makeRoomForTargetCells = ({ cellMapping, extraRows, extraColumns }) => {
    if (extraColumns > 0) {
        insertNewColumns(extraColumns);
    }
    if (extraRows > 0) {
        insertNewRows(extraRows);
    }
    return cellMapping;
}

const hasSubsheetCells = cellMapping => R.reduce(
    (accumulator, cellMapItem) => R.pipe(
        cellSubsheetId,
        isNothing
    )(cellMapItem[1]) // cellMapItem is an array of [sourceCell, targetCell]. We need to check the targetCells only
        ? accumulator // the targetCell has no subsheetId so return false (the original value of the accumulator)
        : R.reduced(true), // the targetCell has a subsheetId so stop and return true
    false, //initial value assume no subsheet cells
    cellMapping
);

const mapTargetCells = R.curry((targetStartCell, rangeShape) => {
    if (isNothing(targetStartCell)) {
		log({ level: LOG.WARN }, 'mapTargetCells did not get all the required parameters');
      return;
    }
	 if (isNothing(rangeShape) || isNothing(rangeShape.rowSpan) || isNothing(rangeShape.columnSpan)) {
		 // we didn't get a legit (rectangular) rangeShape
		return;
	 }
    const orderedSourceCells = orderVisibleClipboardCells();
	 console.log('clipboardHelpers--mapTargetCells got orderedSourceCells', orderedSourceCells);
    const startCellRowIndex = cellRow(targetStartCell);
    const startCellColumnIndex = cellColumn(targetStartCell);

    const [ extraRows, extraColumns ] = getExtraSpaceNeeded(startCellRowIndex, startCellColumnIndex, rangeShape);

    const visibleRowIndicies = getVisibleAxisIndicies(startCellRowIndex, ROW_AXIS);
    const visibleColumnIndicies = getVisibleAxisIndicies(startCellColumnIndex, COLUMN_AXIS);

    const requiredRowIndicies = adjustIndiciesArrToShape({ lengthNeeded: rangeShape.rowSpan, indiciesArr: visibleRowIndicies, axis: ROW_AXIS});
    const requiredColumnIndicides = adjustIndiciesArrToShape({ lengthNeeded: rangeShape.columnSpan, indiciesArr: visibleColumnIndicies, axis: COLUMN_AXIS });
	 console.log('clipboardHelpers--mapTargetCells got requiredRowIndicies',requiredRowIndicies, 'requiredColumnIndicides', requiredColumnIndicides);

    return R.pipe(
        () => reduceWithIndex(
            (rowAccumulator, rowIndex, rowArrIndex) => {
                const rowMapping = reduceWithIndex(
                    (columnAccumulator, columnIndex, columnArrIndex) => {
								console.log('clipboardHelpers--mapTargetCells will get sourceCell from orderedSourceCells at the index given by rowArrIndex * rangeShape.columnSpan + columnArrIndex',rowArrIndex, rangeShape.columnSpan, columnArrIndex);
                        const sourceCell = orderedSourceCells[rowArrIndex * rangeShape.columnSpan + columnArrIndex]; // this calculates how far thru the orderedSourceCells array we are
								const targetCell = getTargetCell(rowIndex, columnIndex);
								console.log('clipboardHelpers--mapTargetCells got sourceCell',sourceCell, 'targetCell', targetCell);
								return R.append([sourceCell, targetCell], columnAccumulator);
                    },
                    [], // initial value
                    requiredColumnIndicides
                );
                return R.concat(rowAccumulator, rowMapping);
            },
            [], // initial value
            requiredRowIndicies
        ),
        R.objOf('cellMapping'), // creates a data object with the reduceWithIndex result as the prop 'cellMapping'
        R.assoc('extraRows', extraRows), // add extraRows to the object
        R.assoc('extraColumns', extraColumns) // add extraColumns to the object
    )();
});

/**
 * Known "bug"
 * 1. copy range
 * 2. filter so that part of the range is hidden
 * 3. paste range
 * result: not all the range is pasted
 * desired result: even though some of the source cells might be hidden, they should be pasted in full to the target cells
 * BUT this conflicts with the following situation:
 * 1. filter 
 * 2. copy a range that includes columns/rows that are filtered out
 * 3. paste the range
 * result: only the visible cells are pasted - this is the desired result
 * ....so we're keeping the second scenario and not trying to make the first scenario work.
 * If you copied a range then filtered out some of what you just copied, you shouldn't expect to have your original range in tact
 */
const getRangeShape = () => {
	const fromCell = stateCellRangeFrom(managedStore.state);
	const toCell = stateCellRangeTo(managedStore.state);
	if (isNothing(fromCell) || isNothing(toCell)) {
		const cellRangeArr = stateCellRangeCells(managedStore.state);
		if (!arrayContainsSomething(cellRangeArr)) {
			log({ level: LOG.WARN }, 'could not get a complete range from the clipboard');
			return;
		}

		// we have some cells in the cellRange, likely created fom the system clipboard, so get the row and column span from them
		// note that this array is assumed to be in order of rows then columns (convertTextToCellRange in CellInPlaceEditor should do this)
		const rangeShapeFromCells = R.reduce(
			(accumulator, cell) => {
				const { columnSpan, rowSpan, currentRow, currentColumnSpan } = accumulator;
				// Note: it would be nicer not to have all these nested if-clauses, but is easiest to follow this way
				if (currentRow === null) {
					//initial row
					return { columnSpan: 1, rowSpan: 1, currentRow: cellRow(cell), currentColumnSpan: 1 }
				}
				if (cellRow(cell) === currentRow) {
					if (rowSpan === 1) {
						// this is the first row, so we are adding columns to determine the column span
						return { columnSpan: columnSpan + 1, rowSpan, currentRow, currentColumnSpan: currentColumnSpan + 1 }
					}
					if (columnSpan > currentColumnSpan) {
						// in a row other than the first row, so keep adding to the currentColumnSpan as we move through it
						return { columnSpan, rowSpan, currentRow, currentColumnSpan: currentColumnSpan + 1 }
					}
					log({ level: LOG.DEBUG }, 'clipboardHelpers--getRangeShape range shape of cells is not a rectangle', cellRangeArr);
					return R.reduced({ columnSpan: null, rowSpan: null });
				}
				if (rowSpan > 1 && currentColumnSpan !== columnSpan) {
					// at the end of the previous row, and currentColumnSpan should be === columnSpan...but it is not, which is not allowed
					log({ level: LOG.DEBUG }, 'clipboardHelpers--getRangeShape range shape of cells is not a rectangle', cellRangeArr);
					return R.reduced({ columnSpan: null, rowSpan: null });
				}
				// start of a new row
				return { columnSpan, rowSpan: rowSpan + 1, currentRow: currentRow + 1, currentColumnSpan: 1 }				
			},
			{ columnSpan: 0, rowSpan: 0, currentRow: null, currentColumnSpan: 0 }, // initial values
			cellRangeArr
		);
		return R.pick(['columnSpan', 'rowSpan'], rangeShapeFromCells);
	}
	
	const fromCellColumn = isColumnDirectionForward(fromCell, toCell) ? cellColumn(fromCell) : cellColumn(toCell);
	const toCellColumn = isColumnDirectionForward(fromCell, toCell) ? cellColumn(toCell) : cellColumn(fromCell);
	const columnVisibility = stateColumnVisibility(managedStore.state);
	const numberOfHiddenColumns = arrayContainsSomething(columnVisibility)
		? forLoopReduce(
			(accumulator, index) => {
				if (index < fromCellColumn) {
					// we're not yet at the beginning of the cell range, so skip
					return accumulator;
				}
				if (index > toCellColumn) {
					// we're beyond the end of the cell range, so finish, returning the number we have accumulated 
					return R.reduced(accumulator);
				}
				return R.pipe(
					getObjectFromArrayByKeyValue, 
					R.prop('isVisible'),
					isVisible => isVisible ? accumulator : ++accumulator
				)('index', index, columnVisibility);
			},
			0, //initial number of hidden columns
			stateTotalColumns(managedStore.state)
		)
		: 0; // the columnVisibility array is empty, meaning all columns are visible

	const columnSpan = toCellColumn + 1 - fromCellColumn - numberOfHiddenColumns;
	const fromCellRow = isRowDirectionForward(fromCell, toCell) ? cellRow(fromCell) : cellRow(toCell);
	const toCellRow = isRowDirectionForward(fromCell, toCell) ? cellRow(toCell) : cellRow(fromCell);
	const rowVisibility = stateRowVisibility(managedStore.state);
	const numberOfHiddenRows = arrayContainsSomething(rowVisibility) 
		? forLoopReduce(
			(accumulator, index) => {
				if (index < fromCellRow) {
					// we're not yet at the beginning of the cell range, so skip
					return accumulator;
				}
				if (index > toCellRow) {
					// we're beyond the end of the cell range, so finish, returning the number we have accumulated 
					return R.reduced(accumulator);
				}
				return R.pipe(
					getObjectFromArrayByKeyValue, 
					R.prop('isVisible'),
					isVisible => isVisible ? accumulator : ++accumulator
				)('index', index, rowVisibility);
			},
			0, //initial number of hidden rows
			stateTotalRows(managedStore.state)
		)
		: 0; // // the rowVisibility array is empty, meaning all rows are visible
	const rowSpan = toCellRow + 1 - fromCellRow - numberOfHiddenRows;
	return { columnSpan, rowSpan }
};

export const pasteCellRangeToTarget = cell =>
   R.pipe(
      getRangeShape,
		R.tap(data => console.log('clipboardHelpers--pasteCellRangeToTarget after getRangeShape got', data)),
      mapTargetCells(cell), // will output { cellMapping, extraRows, extraColumns } or undefined
		R.tap(data => console.log('clipboardHelpers--pasteCellRangeToTarget after mapTargetCells got', data)),
      R.cond([
			[ (mappedTargetCellsParams) => isNothing(mappedTargetCellsParams), R.F ],
			[ ({ cellMapping = null }) => hasSubsheetCells(cellMapping), R.pipe(cellRangePasteError, updatedMetadataErrorMessage, R.T) ],
			[ ({ cellMapping }) => !hasSubsheetCells(cellMapping), R.pipe(makeRoomForTargetCells, pasteToTargetCells, registerUpdatedCells, R.T) ]
		])
   )();

export const updateSystemClipboard = text => {
    if (typeof navigator.clipboard.readText !== 'function') {
        log({ level: LOG.WARN }, SYSTEM_CLIPBOARD_UNAVAILABLE_MSG);
    }

    // this does not work for firefox, but it does work for Chrome & Edge
    // could potentially do something where cells aren't copied to the clipboard, but they are in the range store object
    // so could still be pasted within the app
    navigator.permissions.query({name: "clipboard-write"})
    .then(result => {
        if (result.state === 'granted' || result.state === 'prompt') {
            navigator.clipboard.writeText(text)
            .then(
                () => {
                    // clipboard successfully set 
                    log({ level: LOG.INFO }, 'Clipboard successfully updated with value', text);
                },
                () => {
                    // clipboard write failed 
                    log({ level: LOG.ERROR }, 'Clipboard write failed');
                    updatedClipboardError('No sheet copied to the clipboard, sorry!');
                }
            )
            .catch(err => {
                log({ level: LOG.DEBUG }, 'Clipboard write failed', err);
                updatedClipboardError('No sheet copied to the clipboard, sorry!');
            });
        } else {
            log({ level: LOG.DEBUG }, 'Clipboard write failed as result.state was', result.state);
            updatedClipboardError('No sheet copied to the clipboard, sorry!');
        }
    })
    .catch(err => {
        log({ level: LOG.DEBUG }, 'Clipboard write failed. Might be browser iseue. Error was:', err);
        updatedClipboardError('This browser doesn\'t like copying your sheet to the clipboard, sorry! Perhaps try another browser');
    });
}

export const getCellRangeAsText = () => {
    const { toRow, toColumn } = R.converge(
        orderFromAndToAxes, 
        [ stateCellRangeFrom, stateCellRangeTo ]
    )(managedStore.state); // this param is passed to both stateCellRangeFrom & stateCellRangeTo

    const cells = stateCellRangeCells(managedStore.state);
    return ifThen({
        ifCond: arrayContainsSomething,
        thenDo: R.reduce(
            (accumulator, cell) => {
                const cellEndChar = cellColumn(cell) === toColumn
                    ? cellRow(cell) === toRow 
                        ? '' // at the very last cell so no end char is needed
                        : '\n' // at the end of a row, so add a newline
                    : '\t'; // in the middle of a row, so add a tab
                return isSomething(cellText(cell)) ? accumulator + cellText(cell) + cellEndChar : accumulator + cellEndChar
            },
            '' // initial value is an empty string
        ),
        params: { ifParams: [cells], thenParams: [cells] } // since cells is an array and since params could be arrays of individual parameters, need to put cells into a parent array for ifThen to send cells as a single parameter, rather than many
    });
}

const createCell = ({ text, rowIndex, columnIndex }) => R.pipe(
        cellColumnSetter(columnIndex),
        cellRowSetter(rowIndex),
        cellTextSetter(text),
		  cellVisibleSetter(true), // since we're creating a cell range from the system clipboard, every cell should be visible
    )({});

const createCellsInRow = ({ rowTextArr, rowIndex, columnIndex }) => {
    if ( rowTextArr.length === 0 || isNothing(rowIndex) || isNothing(columnIndex)) {
        log({ level: LOG.DEBUG }, 'clipboardHelpers--createCellsInRow unable to continue, rowTextArr', rowTextArr, 'rowIndex', rowIndex, 'columnIndex', columnIndex);
        return;
    }
    const nextCell = createCell({ text: rowTextArr[0], rowIndex, columnIndex });
    return rowTextArr.length > 1
        ? R.pipe(
            createCellsInRow,
            R.prepend(nextCell)
        )({ rowTextArr: R.tail(rowTextArr), rowIndex, columnIndex: columnIndex + 1 })
        : [ nextCell ];
}

const createRowsOfCells = ({ rowsArr, rowIndex, firstColumnIndex }) => {
    if ( rowsArr.length === 0 || isNothing(rowIndex) || isNothing(firstColumnIndex)) {
        log({ level: LOG.DEBUG }, 'clipboardHelpers--createRowsOfCells will not continue, rowsArr', rowsArr, 'rowIndex', rowIndex, 'firstColumnIndex', firstColumnIndex);
        return;
    }
    const rowTextArr = rowsArr[0].split('\t');
    const cellsInRow = createCellsInRow({ rowTextArr, rowIndex, columnIndex: firstColumnIndex });
    return rowsArr.length > 1
        ? R.pipe(
            createRowsOfCells,
            R.concat(cellsInRow)
        )({ rowsArr: R.tail(rowsArr), rowIndex: rowIndex + 1, firstColumnIndex })
        : cellsInRow;
}

export const convertTextToCellRange = ({ text, startingCellRowIndex, startingCellColumnIndex }) =>
   createRowsOfCells({
      rowsArr: text.split(/(?:\n\r|\r\n|\n|\r)/), // these are the various possibilities for end-of-line characters
      rowIndex: startingCellRowIndex,
      firstColumnIndex: startingCellColumnIndex,
   });

export const pasteText = ({ text, cell, cellInPlaceEditorRef }) => {
	const [realStart, realEnd] =
		cellInPlaceEditorRef.current.selectionEnd < cellInPlaceEditorRef.current.selectionStart
			? [cellInPlaceEditorRef.current.selectionEnd, cellInPlaceEditorRef.current.selectionStart]
			: [cellInPlaceEditorRef.current.selectionStart, cellInPlaceEditorRef.current.selectionEnd];
	const beforeHighlight = R.slice(0, realStart, cellText(cell));
	const afterHighlight = R.slice(realEnd, Infinity, cellText(cell));
	const newText = beforeHighlight + text + afterHighlight;
	updatedCell({
		...cell,
		content: { ...cell.content, text: newText },
		isStale: true,
	});
}

export const getSystemClipboard = async () => {
	if (typeof navigator.clipboard.readText !== 'function') {
		log({ level: LOG.WARN }, SYSTEM_CLIPBOARD_UNAVAILABLE_MSG);
		return;
  	}
	const currentSystemClipboard = stateSystemClipboard(managedStore.state);
	const systemClipboardText = await navigator.clipboard.readText();

	if (currentSystemClipboard === systemClipboardText) {
		return null;
	}
	capturedSystemClipboard(systemClipboardText);
	return systemClipboardText;
}