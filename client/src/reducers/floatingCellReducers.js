import * as R from 'ramda';
import { cellReducerCreator } from './cellReducers';
import { isSomething } from '../helpers';
import { createFloatingCellKey } from '../helpers/floatingCellHelpers';
import { 
	UPDATED_FLOATING_CELL,
	ADDED_FLOATING_CELL_KEYS,
	REMOVED_FLOATING_CELL_KEYS,
	CLEARED_ALL_FLOATING_CELL_KEYS,
} from '../actions/floatingCellTypes';
import { FLOATING_CELL_DEFAULT_POSITION, DEFAULT_FLOATING_CELL_TEXT } from '../constants';

const processFloatingCellAction = R.curry((state, sheetId, action) => {
	switch (action.type) {
      case UPDATED_FLOATING_CELL:
			return { ...state, ...action.payload };

		default:
         return state;
	}
});

const isFloatingCellAction = ({ action }) => isSomething(action?.type) && isSomething(action?.payload?.number);

const isMatchingCell = ({ floatingCell, action }) => isFloatingCellAction({ action }) && floatingCell.number === action.payload.number;

const floatingCellReducerFactory = (floatingCell, sheetId) => 
	(state = {}, action) => isMatchingCell({ floatingCell, action }) ? processFloatingCellAction(state, sheetId, action) : state;

let _lastFloatingCellNumber = -1;
const getNextFloatingCellNumber = () => ++_lastFloatingCellNumber;

const createNewFloatingCell = () => {
	const number = getNextFloatingCellNumber();
	const floatingCellKey = createFloatingCellKey(number);
	const floatingCell = {
		number,
		position: FLOATING_CELL_DEFAULT_POSITION,
		content: {
			formattedText: {
				blocks: [
					{
						inlineStyleRanges: [],
						text: DEFAULT_FLOATING_CELL_TEXT 
						// note that keys are added by the updatedFloatingCell action
					}

				]
			}
		}
	}
	return { number, floatingCellKey, floatingCell } 
}

export const createFloatingCellReducer = sheetId => {
	const { floatingCellKey, floatingCell } = createNewFloatingCell();
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