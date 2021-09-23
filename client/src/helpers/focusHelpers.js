import * as R from 'ramda';
import managedStore from '../store';
import {
    stateFocusCellRef,
    stateFocusCell,
    stateFocusAbortControl,
    stateCellRangeFrom,
    stateCellRangeTo,
    statePresent,
    cellRow,
    cellColumn,
} from './dataStructureHelpers';
import { tabToNextVisibleCell, createCellKey } from './cellHelpers';
import { isSomething, isNothing, ifThen, ifThenElse, } from '.';
import { updatedFocusRef, updatedFocusAbortControl, focusedCell, highlightedCellRange } from '../actions/focusActions';
import { addCellToRange, removeCellFromRange } from '../actions/cellActions';

export const isStateCellRefThisCell = (cellRef, cell) => {
    const currentFocusedCell = stateFocusCell(managedStore.state);
    const currentFocusedCellRef = stateFocusCellRef(managedStore.state);
    return currentFocusedCell?.row === cell.row 
       && currentFocusedCell?.column === cell.column
       && isSomething(currentFocusedCellRef?.current)
       && cellRef?.current === currentFocusedCellRef.current;
}

export const manageKeyBindings = ({ event, cell, cellRef, keyBindings }) => {
    ifThen({
       ifCond: isSomething(event),
       thenDo: () => event.preventDefault(),
       params: {},
    });

    if (isStateCellRefThisCell(cellRef, cell)) {
       return false; // indicates we didn't need to change focus
    }
    // make sure any previous cell no longer has its keydown listener
    ifThen({
       ifCond: isSomething(stateFocusAbortControl(managedStore.state)),
       thenDo: () => stateFocusAbortControl(managedStore.state).abort(),
       params: {},
    });
    const controller = new AbortController();
    updatedFocusAbortControl(controller, cell);
    document.addEventListener('keydown', evt => keyBindings(evt), { signal: controller.signal });
    updatedFocusRef(cellRef);
    return true; // indicates we changed the focus
}

export const manageTab = ({ event, cell, callback }) => {
    event.preventDefault();
    const nextCell = tabToNextVisibleCell(cell.row, cell.column, event.shiftKey);
    return ifThenElse({
        ifCond: isSomething(nextCell),
        thenDo: [
            () => isSomething(callback) ? callback() : null,
            () => stateFocusAbortControl(managedStore.state).abort(),
            () => updatedFocusRef({ ref: null }), // clear the existing focusRef
            () => focusedCell(nextCell),
            R.T // indicates that we found a nextCell and tabbed to it
        ],
        elseDo: R.F, // indicates we didn't move cells
        params: {}
    });
}

export const isRowDirectionForward = (fromCell, toCell) => cellRow(fromCell) <= cellRow(toCell);
export const isColumnDirectionForward = (fromCell, toCell) => cellColumn(fromCell) <= cellColumn(toCell);

export const orderFromAndToAxes = (fromCell, toCell) => {
    // if the 'from' cell comes after the 'to' cell, then we will swap what we're calling from and to 
    const rowDirectionForward = isRowDirectionForward(fromCell, toCell);
    const columnDirectionForward = isColumnDirectionForward(fromCell, toCell);
    return {
        fromRow: rowDirectionForward ? fromCell.row : toCell.row,
        toRow: rowDirectionForward ? toCell.row : fromCell.row,
        fromColumn: columnDirectionForward ? fromCell.column : toCell.column,
        toColumn: columnDirectionForward ? toCell.column : fromCell.column,
    } 
}

export const updateCellsInRange = addingCells => {
    const fromCell = stateCellRangeFrom(managedStore.state);
    const toCell = stateCellRangeTo(managedStore.state);
    if (isNothing(fromCell) || isNothing(toCell)) {
        return;
    }
    
    const { fromRow, toRow, fromColumn, toColumn } = orderFromAndToAxes(fromCell, toCell);
    console.log('focusHelpers--updateCellsInRange got fromRow', fromRow, 'toRow', toRow, 'fromColumn', fromColumn, 'toColumn', toColumn);
    if (isNothing(fromRow) || isNothing(toRow) || isNothing(fromColumn) || isNothing(toColumn)) {
        // this should never happen
        console.error('focusHelpers.updateCellsInRange cannot proceed because it got fromRow', fromRow, 'toRow', toRow, 'fromColumn', fromColumn, 'toColumn', toColumn);
        return;
    }

    const listCellsInRow = R.curry((row, column) => {
        if (column >= fromColumn && column <= toColumn) {
            const cellKey = createCellKey(row, column);
            const cell = statePresent(managedStore.state)[cellKey];
            addingCells ? addCellToRange(cell) : removeCellFromRange(cell);
            listCellsInRow(row, ++column, fromColumn, toColumn);
        }
    });

    const listCellsInRange = row => ifThen({
        ifCond: row <= toRow,
        thenDo: [
            () => listCellsInRow(row, fromColumn),
            () => listCellsInRange(row + 1)
        ],
        params: {}
    });
    listCellsInRange(fromRow);
}

export const rangeSelected = toCell => {
    const fromCell = stateCellRangeFrom(managedStore.state);
    if (fromCell && (fromCell.row !== toCell.row || fromCell.column !== toCell.column)) {
        document.getSelection().removeAllRanges(); // this stops the content within each cell in the range from getting highlighted. There's a bit of flashing, but no big deal
        highlightedCellRange(toCell);
        updateCellsInRange(true); // true means we're finding and adding all the cells in the range
        return true;
    }
    return false;
}

export const atEndOfRange = cell => {
    const toCell = stateCellRangeTo(managedStore.state);
    return isSomething(stateCellRangeFrom(managedStore.state)) &&
    isSomething(toCell) && 
    cell.row === toCell.row && 
    cell.column === toCell.column;
}