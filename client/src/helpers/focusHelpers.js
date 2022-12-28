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
import { optimizeModalPositioning, } from '.'; //index
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
import {
	CELL_EDITOR_VERTICAL_MARGIN,
	CELL_EDITOR_HORIZONTAL_MARGIN,
} from '../constants';

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
	console.log('focusHelpers--manageFocus got cell', cell);

	if (isStateCellRefThisCell(cellRef, cell)) {
		return false; // indicates we didn't need to change focus
	}
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

export const manageTab = ({ event, cell, callback, goBackwards }) => {
	event?.preventDefault();
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

export const calcEditorPositioning = cellPositioning => R.pipe(
	R.assoc('left', cellPositioning.left + CELL_EDITOR_HORIZONTAL_MARGIN),
	R.assoc('top', cellPositioning.top + CELL_EDITOR_VERTICAL_MARGIN),
	// R.assoc('width', ) // TODO - probably need to tell optimizeModalPositioning what the width is with the full width of the textarea plus the CellEditorTools
	// TODO make sure the height sent to optimizeModalPositioning is the real height
	initialPositioning => optimizeModalPositioning({
		initialTop: initialPositioning.top,
		initialLeft: initialPositioning.left,
		modalWidth: initialPositioning.width,
		// modalHeight: initialPositioning.height + CELL_EDITOR_VERTICAL_PADDING,
	}),
	optimized => ({
		...cellPositioning,
		left: optimized.left,
		top: optimized.top,
		// height: cellPositioning.height + CELL_EDITOR_VERTICAL_PADDING,
	})
)(cellPositioning);