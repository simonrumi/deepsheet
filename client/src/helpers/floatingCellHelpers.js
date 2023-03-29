import * as R from 'ramda';
import managedStore from '../store';
import { isSomething } from '.';
import { decodeFormattedText, getFormattedText, } from '../helpers/richTextHelpers';
import { cleanCell } from '../helpers/cellHelpers';
import { getUserInfoFromCookie } from '../helpers/userHelpers';
import {
	statePresent,
   floatingCellNumber,
   stateFloatingCell,
	stateFloatingCellKeys,
   floatingCellNumberSetter,
   floatingCellPosition,
   floatingCellPositionSetter,
	floatingCellFormattedTextSetter,
	floatingCellFormattedText,
	dbFloatingCells,
} from './dataStructureHelpers';
import { addedFloatingCellKeys, addedFloatingCell } from '../actions/floatingCellActions';

export const FLOATING_CELL_KEY_PREFIX = 'floating_cell_';

export const createFloatingCellKey = floatingCellNumber => FLOATING_CELL_KEY_PREFIX + floatingCellNumber;

export const isFloatingCellTest = cell => isSomething(floatingCellNumber(cell));

export const getFloatingCellFromStore = ({ number, state }) => R.pipe(
	createFloatingCellKey,
	stateFloatingCell(state)
)(number);

// returns an object with only the floatingCell's fields that are savable in the db
export const getSaveableFloatingCellData = floatingCell =>
   R.pipe(
      floatingCellNumberSetter(floatingCellNumber(floatingCell)),
		floatingCellPositionSetter(floatingCellPosition(floatingCell)),
		floatingCellFormattedTextSetter(floatingCellFormattedText(floatingCell)),
   )({});

export const getAllFloatingCells = state => R.pipe(
	stateFloatingCellKeys,
	R.map(floatingCellKey => statePresent(state)[floatingCellKey])
)(state);

const getAllFloatingCellReducerNames = R.map(floatingCell => createFloatingCellKey(floatingCell.number));

export const removeAllFloatingCellReducers = () => R.pipe(
	managedStore.store.getState,
	getAllFloatingCells,
	getAllFloatingCellReducerNames,
	managedStore.store.reducerManager.removeMany,
	managedStore.store.replaceReducer
)();

export const populateFloatingCellsInStore = sheet => {
	const floatingCells = dbFloatingCells(sheet);
	R.pipe(
		R.map(floatingCell => createFloatingCellKey(floatingCellNumber(floatingCell))),
		addedFloatingCellKeys
	)(floatingCells);

	R.forEach(floatingCell =>
		R.pipe(
			getFormattedText,
			decodeFormattedText,
			floatingCellFormattedTextSetter(R.__, floatingCell),
			addedFloatingCell
		)(floatingCell)
	)(floatingCells);
}

export const createFloatingCellsMutationData = action => ({
	floatingCells: R.map(cell => cleanCell(cell))(action.payload?.floatingCells),
	sheetId: action.payload?.floatingCellsSheetId || action.payload?.sheetId, 
	userId: R.pipe(getUserInfoFromCookie, R.prop('userId'))(),
});