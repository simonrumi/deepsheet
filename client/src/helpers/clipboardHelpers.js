import * as R from 'ramda';
import managedStore from '../store';
import { isNothing, isSomething, compareIndexValues, forLoopReduce, ifThenElse } from '.';
import { isRangeDirectionForward } from './focusHelpers';
import { createCellKey } from './cellHelpers';
import { 
    statePresent,
    stateClipboardRangeFrom,
    stateClipboardRangeTo, 
    stateClipboardRangeCells,
    cellColumn,
    cellRow,
    cellSubsheetId,
    cellRowSetter,
    cellColumnSetter,
    cellTextSetter,
    cellVisibleSetter,
    stateTotalRows,
    stateTotalColumns,
} from './dataStructureHelpers';
import { updatedCell } from '../actions/cellActions';
import insertNewColumns from '../services/insertNewColumns';
import insertNewRows from '../services/insertNewRows';
import { cellRangePasteError } from '../components/displayText';

const getRangeShape = () => {
    const fromCell = stateClipboardRangeFrom(managedStore.state);
    const toCell = stateClipboardRangeTo(managedStore.state);
    if (isNothing(fromCell) || isNothing(toCell)) {
        console.warn('could not get a complete range from the clipboard');
        return;
    }
    const rangeDirection = isRangeDirectionForward(fromCell, toCell);
    const columnSpan = rangeDirection
        ? cellColumn(toCell) + 1 - cellColumn(fromCell)
        : cellColumn(fromCell) + 1 - cellColumn(toCell);
    const rowSpan = rangeDirection
        ? cellRow(toCell) + 1 - cellRow(fromCell)
        : cellRow(fromCell) + 1 - cellRow(toCell);
    return { columnSpan, rowSpan }
};

const createPlaceholderCell = (row, column) => R.pipe(
        cellRowSetter(row),
        cellColumnSetter(column),
        cellTextSetter(''),
        cellVisibleSetter(true),
    )({});

const getTargetCell = (startCellRowIndex, rowIndex, starCellColumnIndex, columnIndex) => R.pipe(
        createCellKey,
        R.prop(R.__, statePresent(managedStore.state)), // uses the cellKey to get the targetCell from the store
        maybeTargetCell => isSomething(maybeTargetCell)
            ? maybeTargetCell
            : createPlaceholderCell(startCellRowIndex + rowIndex, starCellColumnIndex + columnIndex)
    )(startCellRowIndex + rowIndex, starCellColumnIndex + columnIndex);

const getExtraSpaceNeeded = (startCellRowIndex, starCellColumnIndex, rangeShape) => {
    const extraRows = startCellRowIndex + rangeShape.rowSpan - stateTotalRows(managedStore.state);
    const extraColumns = starCellColumnIndex + rangeShape.columnSpan - stateTotalColumns(managedStore.state);
    return [
        extraRows > 0 ? extraRows : 0,
        extraColumns >  0 ? extraColumns : 0
    ]
}

const orderClipboardCells = () => R.pipe(
    stateClipboardRangeCells,
    R.sort(compareIndexValues)
)(managedStore.state);

const mapTargetCells = R.curry((targetStartCell, rangeShape) => {
    if (isNothing(targetStartCell) || isNothing(rangeShape)) {
        console.warn('mapTargetCells did not get all the required parameters');
        return;
    }
    const orderedSourceCells = orderClipboardCells();
    const startCellRowIndex = cellRow(targetStartCell);
    const starCellColumnIndex = cellColumn(targetStartCell);

    const [ extraRows, extraColumns ] = getExtraSpaceNeeded(startCellRowIndex, starCellColumnIndex, rangeShape);
    console.log('clipboardHelpers.mapTargetCells got extraRows', extraRows, 'extraColumns', extraColumns);
    
    return R.pipe(
        () => forLoopReduce(
            (rowAccumulator, rowIndex) => {
                const rowMapping = forLoopReduce(
                    (columnAccumulator, columnIndex) => {
                        const sourceCell = orderedSourceCells[rowIndex * rangeShape.columnSpan + columnIndex]; // when we are at the shape coordinates (rowIndex, columnIndex), this is how far thru the orderedSourceCells array we are
                        const targetCell = getTargetCell(startCellRowIndex, rowIndex, starCellColumnIndex, columnIndex);
                        return R.append([sourceCell, targetCell], columnAccumulator);
                    },
                    [], // initial value
                    rangeShape.columnSpan
                );
                console.log('clipboardHelpers.mapTargetCells got rowMapping', rowMapping);
                return R.concat(rowAccumulator, rowMapping);
            }, 
            [], //initial value 
            rangeShape.rowSpan
        ),
        R.objOf('cellMapping'), // creates a data object with the forLoopReduce result as the prop 'cellMapping'
        R.assoc('extraRows', extraRows), // add extraRows to the object
        R.assoc('extraColumns', extraColumns) // add extraColumns to the object
    )();
});

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

const makeRoomForTargetCells = ({ cellMapping, extraRows, extraColumns }) => {
    console.log('clipboardHelpers.makeRoomForTargetCells got extraRows', extraRows, 'extraColumns', extraColumns);
    insertNewColumns(extraColumns);
    insertNewRows(extraRows);
    return cellMapping;
}

const pasteToTargetCells = targetMap => {
    console.log('clipboardHelpers.pasteToTargetCells got targetMap', targetMap);
    R.forEach(
        ([ sourceCell, targetCell ]) => R.pipe(
            cellRowSetter(cellRow(targetCell)),
            cellColumnSetter(cellColumn(targetCell)),
            updatedCell
        )(sourceCell), // start with the sourceCell and then update the row and column to that of the targetCell
        targetMap
    )
};

export const pasteCellRangeToTarget = (cell, setError) => {
    R.pipe(
       getRangeShape,
       R.tap(data => console.log('clipboardHelpers.handlePaste getRangeShape returned', data)),
       mapTargetCells(cell),
       R.tap(data => console.log('clipboardHelpers.handlePaste mapTargetCells returned', data)),
       ({ cellMapping, extraRows, extraColumns }) => ifThenElse({
          ifCond: hasSubsheetCells,
          thenDo: R.pipe(cellRangePasteError, setError),
          elseDo: [ makeRoomForTargetCells, pasteToTargetCells ],
          params: { ifParams: [cellMapping], elseParams: { cellMapping, extraRows, extraColumns } }
       }),
       R.tap(data => console.log('clipboardHelpers.handlePaste after cellMapping returned', data))
    )()
}