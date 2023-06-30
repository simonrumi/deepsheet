import * as R from 'ramda';
import { cellReducerCreator } from './cellReducers';
import { isSomething } from '../helpers';
import { createFloatingCellKey, createFloatingCellNumber, } from '../helpers/floatingCellHelpers';
import { createUpdatedCellState } from '../helpers/cellHelpers';
import { dbFloatingCells, floatingCellNumber, dbSheetId } from '../helpers/dataStructureHelpers';
import { 
	ADDED_FLOATING_CELL,
	UPDATED_FLOATING_CELL,
	ADDED_FLOATING_CELL_KEYS,
	REMOVED_FLOATING_CELL_KEYS,
	CLEARED_ALL_FLOATING_CELL_KEYS,
	UPDATED_FLOATING_CELL_STARTING_POSITION,
	DELETED_FLOATING_CELL,
	COMPLETED_SAVE_FLOATING_CELL,
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

		case COMPLETED_SAVE_FLOATING_CELL:
			return createUpdatedCellState(action.payload, state, sheetId); // note that this is the same fn as used for regular cells - a separate fn wasn't needed

		default:
         return state;
	}
});

const isFloatingCellAction = ({ action }) => isSomething(action?.type) && isSomething(action?.payload?.number);

const isMatchingCell = ({ floatingCell, action }) => isFloatingCellAction({ action }) && floatingCell.number === action.payload.number;

const floatingCellReducerFactory = (floatingCell, sheetId) => 
	(state = {}, action) => isMatchingCell({ floatingCell, action }) ? processFloatingCellAction(state, sheetId, action) : state;

const createNewFloatingCell = floatingCellPositioning => {
	const number = createFloatingCellNumber();
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

export const fromDbCreateFloatingCellReducers = sheetHistory => {
	const thunkifiedCreatorFunc = R.thunkify(
		R.pipe(
			dbFloatingCells,
			R.reduce(
				(accumulator, floatingCell) => {
					const floatingCellReducer = floatingCellReducerFactory(floatingCell, dbSheetId(sheetHistory));
					const floatingCellKey = createFloatingCellKey(floatingCellNumber(floatingCell));
					return R.assoc(floatingCellKey, floatingCellReducer, accumulator);
				},
				{},
			)
		)
	)(sheetHistory);
	cellReducerCreator(thunkifiedCreatorFunc);
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