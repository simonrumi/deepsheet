import * as R from 'ramda';
import managedStore from '../store';
import {
    stateFocusCellRef,
    stateFocusCell,
    stateFocusAbortControl,
} from './dataStructureHelpers';
import { tabToNextVisibleCell } from './cellHelpers';
import { isSomething, ifThen, ifThenElse } from '.';
import { updatedFocusRef, updatedFocusAbortControl, focusedCell } from '../actions/focusActions';

export const isStateCellRefThisCell = (cellRef, cell) => {
    const currentFocusedCell = stateFocusCell(managedStore.state);
    const currentFocusedCellRef = stateFocusCellRef(managedStore.state);
    return currentFocusedCell?.row === cell.row 
       && currentFocusedCell?.column === cell.column
       && isSomething(currentFocusedCellRef?.current)
       && cellRef?.current === currentFocusedCellRef.current;
}

export const manageFocus = ({ event, cell, cellRef, keyBindings }) => {
    ifThen({
       ifCond: isSomething(event),
       thenDo: () => event.preventDefault(),
       params: {},
    });
    console.log('focusHelpers.manageFocus got cell row', cell.row, 'column', cell.column, 'cellRef.current', cellRef.current);

    if (isStateCellRefThisCell(cellRef, cell)) {
       console.log('cellRef.manageFocus already focused cell row', cell.row, 'column', cell.column, 
       'and stateFocusCellRef(managedStore.state).current', stateFocusCellRef(managedStore.state)?.current, 'so not doing all the manageFocus stuff again');
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
    console.log('focusHelpers.manageFocus got cell row', cell.row, 'column', cell.column, 'calling addEventListener');
    document.addEventListener('keydown', evt => keyBindings(evt), { signal: controller.signal });
    updatedFocusRef(cellRef);
    return true; // indicates we changed the focus
}

export const manageTab = ({ event, cell, callback }) => {
    event.preventDefault();
    console.log('***************** TAB *****************\n**** focusHelpers.manageTab about to run abort() for cell', cell);
    const nextCell = tabToNextVisibleCell(cell.row, cell.column, event.shiftKey);
    console.log('focusHelpers.manageTab called tabToNextVisibleCell and got nextCell', nextCell, 'which determines whether to update the focus or not')
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