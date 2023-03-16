import * as R from 'ramda';
import managedStore from '../store';
import { cellReducerCreator } from './cellReducers';
import { isSomething } from '../helpers';
import { createFloatingCellKey, FLOATING_CELL_KEY_PREFIX } from '../helpers/floatingCellHelpers';
import { stateFloatingCellKeys } from '../helpers/dataStructureHelpers';
import { 
	ADDED_FLOATING_CELL,
	UPDATED_FLOATING_CELL,
	ADDED_FLOATING_CELL_KEYS,
	REMOVED_FLOATING_CELL_KEYS,
	CLEARED_ALL_FLOATING_CELL_KEYS,
	UPDATED_FLOATING_CELL_STARTING_POSITION,
	DELETED_FLOATING_CELL,
} from '../actions/floatingCellTypes';
import { DEFAULT_FLOATING_CELL_TEXT } from '../constants';

const processFloatingCellAction = R.curry((state, sheetId, action) => {
	switch (action.type) {
		case ADDED_FLOATING_CELL:
			return { ...state, ...action.payload };

      case UPDATED_FLOATING_CELL:
			return { ...state, ...action.payload };

		case DELETED_FLOATING_CELL:
			return null;

		default:
         return state;
	}
});

const isFloatingCellAction = ({ action }) => isSomething(action?.type) && isSomething(action?.payload?.number);

const isMatchingCell = ({ floatingCell, action }) => isFloatingCellAction({ action }) && floatingCell.number === action.payload.number;

const floatingCellReducerFactory = (floatingCell, sheetId) => 
	(state = {}, action) => isMatchingCell({ floatingCell, action }) ? processFloatingCellAction(state, sheetId, action) : state;

const cellNumberRegex = new RegExp(`${FLOATING_CELL_KEY_PREFIX}(\\d*)`);

const getNextFloatingCellNumber = () => {
	const highestFloatingCellNum = R.reduce(
		(accumulator, floatingCellKey) => R.pipe(
			R.match(cellNumberRegex),
			R.prop(1),
			parseInt,
			floatingCellNum => floatingCellNum > accumulator ? floatingCellNum : accumulator
		)(floatingCellKey),
		-1, // initial value is lower than the lowest possible floating cell number
		stateFloatingCellKeys(managedStore.state)
	);
	return highestFloatingCellNum + 1;
}

const createNewFloatingCell = floatingCellPositioning => {
	const number = getNextFloatingCellNumber();
	const floatingCellKey = createFloatingCellKey(number);
	const floatingCell = {
		number,
		position: floatingCellPositioning,
		content: {
			formattedText: {
				blocks: [
					{
						inlineStyleRanges: [],
						text: DEFAULT_FLOATING_CELL_TEXT 
						// note that keys are added by either the addedFloatingCell or the updatedFloatingCell actions
					}

				]
			}
		}
	}
	return { number, floatingCellKey, floatingCell } 
}

export const createFloatingCellReducer = (sheetId, floatingCellPositioning) => {
	const { floatingCellKey, floatingCell } = createNewFloatingCell(floatingCellPositioning);
	const creatorFunc = () => {
		const floatingCellReducer = floatingCellReducerFactory(floatingCell, sheetId);
		return { [floatingCellKey]: floatingCellReducer }
	};
	cellReducerCreator(creatorFunc);
	return { floatingCellKey, floatingCell };
}

export const floatingCellKeysReducer = (state = [], action) => {
   switch (action.type) {
      case ADDED_FLOATING_CELL_KEYS:
         return action.payload instanceof Array ? R.concat(state, action.payload) : R.append(action.payload, state);

      case REMOVED_FLOATING_CELL_KEYS:
         return action.payload instanceof Array ? R.without(action.payload, state) : R.without([action.payload], state);

      case CLEARED_ALL_FLOATING_CELL_KEYS:
         return [];

      default:
         return state;
   }
}

export const floatingCellPositionReducer = (state = [], action) => {
   switch (action.type) {
		case UPDATED_FLOATING_CELL_STARTING_POSITION:
			return { ...state, startingPosition: action.payload }

		default:
         return state;
   }
}