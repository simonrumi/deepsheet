import * as R from 'ramda';
import managedStore from '../store';
import {
   isNothing,
   isSomething,
   compareIndexValues,
   forLoopReduce,
   reduceWithIndex,
   ifThenElse,
   getObjectFromArrayByKeyValue,
} from '.';
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
    stateColumnVisibility,
    stateRowVisibility,
} from './dataStructureHelpers';
import { updatedCell, hasChangedCell } from '../actions/cellActions';
import { updatedMetadataErrorMessage } from '../actions/metadataActions';
import insertNewColumns from '../services/insertNewColumns';
import insertNewRows from '../services/insertNewRows';
import { cellRangePasteError } from '../components/displayText';
import { ROW_AXIS, COLUMN_AXIS } from '../constants';

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

const adjustIndiciesArrToShape = (lengthNeeded, indiciesArr, axis) => indiciesArr.length === lengthNeeded
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

const orderClipboardCells = () => R.pipe(
    stateClipboardRangeCells,
    R.sort(compareIndexValues)
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
    insertNewColumns(extraColumns);
    insertNewRows(extraRows);
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
    if (isNothing(targetStartCell) || isNothing(rangeShape)) {
        console.warn('mapTargetCells did not get all the required parameters');
        return;
    }
    const orderedSourceCells = orderClipboardCells();
    const startCellRowIndex = cellRow(targetStartCell);
    const starCellColumnIndex = cellColumn(targetStartCell);

    const [ extraRows, extraColumns ] = getExtraSpaceNeeded(startCellRowIndex, starCellColumnIndex, rangeShape);

    const visibleRowIndicies = getVisibleAxisIndicies(startCellRowIndex, ROW_AXIS);
    const visibleColumnIndicies = getVisibleAxisIndicies(starCellColumnIndex, COLUMN_AXIS);
    
    const requiredRowIndicies = adjustIndiciesArrToShape(rangeShape.rowSpan, visibleRowIndicies, ROW_AXIS);
    const requiredColumnIndicides = adjustIndiciesArrToShape(rangeShape.columnSpan, visibleColumnIndicies, COLUMN_AXIS);

    return R.pipe(
        () => reduceWithIndex(
            (rowAccumulator, rowIndex, rowArrIndex) => {
                const rowMapping = reduceWithIndex(
                    (columnAccumulator, columnIndex, columnArrIndex) => {
                        const sourceCell = orderedSourceCells[rowArrIndex * rangeShape.columnSpan + columnArrIndex]; // this calculates how far thru the orderedSourceCells array we are
                        const targetCell = getTargetCell(rowIndex, columnIndex);
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

export const pasteCellRangeToTarget = cell => R.pipe(
    getRangeShape,
    mapTargetCells(cell),
    ({ cellMapping, extraRows, extraColumns }) => ifThenElse({
        ifCond: hasSubsheetCells,
        thenDo: R.pipe(cellRangePasteError, updatedMetadataErrorMessage),
        elseDo: [ makeRoomForTargetCells, pasteToTargetCells, registerUpdatedCells ],
        params: { ifParams: [cellMapping], elseParams: { cellMapping, extraRows, extraColumns } }
    }),
)();