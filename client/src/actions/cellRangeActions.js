import managedStore from '../store';
import { 
	HIGHLIGHTED_CELL_RANGE,
	CLEARED_CELL_RANGE,
	UPDATED_FROM_CELL,
	CLEAR_LIST_OF_CELLS_IN_RANGE,
	REPLACED_CELLS_IN_RANGE,
	UPDATED_RANGE_WAS_COPIED,
	UPDATED_PASTING_CELL_RANGE,
} from './cellRangeTypes';

export const highlightedCellRange = cellData => {
	managedStore.store.dispatch({
	   type: HIGHLIGHTED_CELL_RANGE,
	   payload: { cell: cellData }
	});
};

// Note that addCellToRange is found in cellActions because it has to update the cell as well as the cellRange
 
 export const clearedCellRange = cellData => {
	managedStore.store.dispatch({
	   type: CLEARED_CELL_RANGE,
	   payload: { cell: cellData }
	});
}
 
 export const updatedFromCell = cell => {
	managedStore.store.dispatch({
	   type: UPDATED_FROM_CELL,
	   payload: cell
	});
}

export const clearListOfCellsInRange = () => {
	managedStore.store.dispatch({
		type: CLEAR_LIST_OF_CELLS_IN_RANGE,
	});
}

export const replacedCellsInRange = cells => {
	managedStore.store.dispatch({
		type: REPLACED_CELLS_IN_RANGE,
		payload: cells
	});
}

export const updatedRangeWasCopied = rangeWasCopied => {
	managedStore.store.dispatch({
		type: UPDATED_RANGE_WAS_COPIED,
		payload: rangeWasCopied
	});
}

export const updatedPastingCellRange = isPastingCellRange => {
	managedStore.store.dispatch({
		type: UPDATED_PASTING_CELL_RANGE,
		payload: isPastingCellRange
	});
}