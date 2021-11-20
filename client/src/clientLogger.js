import * as R from 'ramda';
import { LOG, CLIENT_LOG_LEVEL } from './constants';

const stateKeys = [
    'auth',
    'cellKeys',
    'cellDbUpdates',
    'cellRange',
    'clipboard',
    'dragMonitor',
    'filterModal',
    'focus',
    'menu',
    'metadata',
	 'pasteOptionsModal',
    'sheet',
    'sheets',
    'sortModal',
    'title',
    'globalInfoModal',
];
 
export const logState = wrappedState => {
    if (CLIENT_LOG_LEVEL < LOG.INFO) {
        return;
    }
    const state = wrappedState.present;
    const baseStateObj = R.reduce(
        (acc, key) => {
            acc[key] = state[key];
            return acc;
        },
        {},
        stateKeys
    );
    const cellReducersArr = R.map(
        cellKey => R.assoc(cellKey, state[cellKey], {})
    )(state.cellKeys)

    // note that the cellReducers are logged as being in an array called cellReducers, but in the store every cell reducer is stored at the top level
    const fullStateObj = R.mergeAll([baseStateObj, { cellReducers: cellReducersArr }]);
    console.log({ ...wrappedState, present: fullStateObj });
};

export function log({ level }, message) {
    if (level > CLIENT_LOG_LEVEL) {
        return;
    }
    const messages = R.slice(1, Infinity, arguments);
    console.log(...messages);
}