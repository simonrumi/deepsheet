import * as R from 'ramda';
import managedStore from '../store';
import { isSomething, isNothing } from '.';
import { decodeFormattedText, getFormattedText, } from '../helpers/richTextHelpers';
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

const cellNumberRegex = new RegExp(`${FLOATING_CELL_KEY_PREFIX}(\\d*)`);

const findNumberInExistingKeys = R.curry((number, existingFloatingCellKeys) => R.find(
	existingFloatingCellKey => R.pipe( // the function to search the array with
		cellKey => cellKey.match(cellNumberRegex),
		R.prop(1), // the captured number string is in the 2nd element of the returned array
		parseInt,
		R.equals(number)
	)(existingFloatingCellKey),
	existingFloatingCellKeys // the array to search
));

export const createFloatingCellNumber = () => {
	const MULTIPLIER = Math.pow(2, 24);
	const generateNumber = () => Math.floor(Math.random() * MULTIPLIER);
	const number = R.until(
		generatedNumber => R.pipe(   // this is the predicate - a function that returns true if the generated number is not already being used
			stateFloatingCellKeys,
			findNumberInExistingKeys(generatedNumber), 
			isNothing
		)(managedStore.state),
		generateNumber, // this function is called until the predicate above returns true
		generateNumber() // initial value for "generatedNumber" to try in the predicate function
	)
	return number;
}

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