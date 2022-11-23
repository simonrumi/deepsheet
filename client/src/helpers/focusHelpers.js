import * as R from 'ramda';
import managedStore from '../store';
import {
	stateFocusCellRef,
	stateFocusCell,
	stateFocusAbortControl,
	stateCellRangeMaybeFrom,
	stateCellRangeFrom,
	stateCellRangeTo,
	stateCellRangeCells,
	cellInCellRangeSetter,
} from './dataStructureHelpers';
import { tabToNextVisibleCell } from './cellHelpers';
import { updateCellsInRange } from './rangeToolHelpers';
import { isSomething, arrayContainsSomething, ifThen, ifThenElse, } from '.';
import { updatedFocusRef, updatedFocusAbortControl, focusedCell, clearedFocus } from '../actions/focusActions';
import {
   highlightedCellRange,
   updatedFromCell,
   startedHighlightingRange,
   completedHighlightingRange,
} from '../actions/cellRangeActions';
import { HIGHLIGHTED_CELL_RANGE } from '../actions/cellRangeTypes';
import { updatedCell } from '../actions/cellActions';
import { createHighlightRangeMessage } from '../components/displayText';
import { log } from '../clientLogger';
import { LOG } from '../constants';

export const isStateCellRefThisCell = (cellRef, cell) => {
    const currentFocusedCell = stateFocusCell(managedStore.state);
    const currentFocusedCellRef = stateFocusCellRef(managedStore.state);
    return currentFocusedCell?.row === cell.row 
       && currentFocusedCell?.column === cell.column
       && isSomething(currentFocusedCellRef?.current)
       && cellRef?.current === currentFocusedCellRef.current;
}

export const manageFocus = ({ event, cell, cellRef, keyBindings }) => {
	event?.preventDefault();
	console.log('focusHelpers--manageFocus got cell', cell, 'keyBindings', keyBindings);

	if (isStateCellRefThisCell(cellRef, cell)) {
		console.log('focusHelpers--manageFocus cell ref is this cell, so no need to change focus', cell);
		return false; // indicates we didn't need to change focus
	}
	ifThen({
		ifCond: isSomething(stateFocusAbortControl(managedStore.state)),
		thenDo: () => stateFocusAbortControl(managedStore.state).abort(),
		params: {},
	});
	const controller = new AbortController();
	console.log('focusHelpers--manageFocus made AbortController', controller);
	updatedFocusAbortControl(controller, cell);
	document.addEventListener('keydown', evt => keyBindings(evt), { signal: controller.signal });
	updatedFocusRef(cellRef);
	return true; // indicates we changed the focus
}

export const manageTab = ({ cell, callback, goBackwards }) => {
    const nextCell = tabToNextVisibleCell(cell.row, cell.column, goBackwards);
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

export const clearCellRangeHighlight = () => R.pipe(
	stateCellRangeCells,
	cells => ifThen({
		ifCond: arrayContainsSomething,
		thenDo: R.forEach(cell => R.pipe(cellInCellRangeSetter, updatedCell)(false, cell)),
		params: { ifParams: [cells], thenParams: [cells] },
	})
)(managedStore.state);

export const rangeSelected = toCell => {
	const fromCell = stateCellRangeMaybeFrom(managedStore.state);
	if (fromCell && (fromCell.row !== toCell.row || fromCell.column !== toCell.column)) {
		const message = createHighlightRangeMessage({ fromCell, toCell });
		startedHighlightingRange({ undoableType: HIGHLIGHTED_CELL_RANGE, timestamp: Date.now() });
		document.getSelection().removeAllRanges(); // this stops the content within each cell in the range from getting highlighted. There's a bit of flashing, but no big deal
		updatedFromCell(fromCell);
		highlightedCellRange(toCell);
		updateCellsInRange(true); // true means we're finding and adding all the cells in the range
		completedHighlightingRange({ undoableType: HIGHLIGHTED_CELL_RANGE, message, timestamp: Date.now() });
		return true;
	}
	return false;
}

/**
 * clearSubsheetCellFocus is for use in the case where 
 * 1. user clicks on a SubsheetCell
 * 2. user shift-clicks some other cell to create a range
 * 3. now call this function to clear the focus of the cell from step #1
 */
export const maybeClearSubsheetCellFocus = () => {
	const fromCell = stateCellRangeFrom(managedStore.state);
	const focusedCell = stateFocusCell(managedStore.state);
	if (fromCell === focusedCell) {
		stateFocusAbortControl(managedStore.state).abort();
   	updatedFocusRef({ ref: null }); // this is probably redundant, since clearedFocus clears everything
		clearedFocus();
	}
}

export const atEndOfRange = cell => {
	const toCell = stateCellRangeTo(managedStore.state);
	return isSomething(stateCellRangeFrom(managedStore.state)) &&
	isSomething(toCell) && 
	cell.row === toCell.row && 
	cell.column === toCell.column;
}