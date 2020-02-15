import * as R from 'ramda';
import managedStore from '../store';
import { cellReducerFactory } from '../reducers/cellReducers';
import { updatedCell } from '../actions';

// returns copy of cellReducers with and added cellReducer
export const addOneCellReducer = (cellKey, row, column, cellReducers = {}) =>
	R.pipe(
		cellReducerFactory,
		R.assoc(cellKey, R.__, cellReducers)
	)(row, column);

export const addNewCellsToStore = cells => R.map(cell => updatedCell(cell), cells);

export const addManyCellReducersToStore = cellReducers => {
	const combineNewReducers = managedStore.store.reducerManager.addMany(cellReducers);
	managedStore.store.replaceReducer(combineNewReducers);
};

export const maybeAddAxisVisibilityEntry = (axisIndex, axisVisibilityObj, updatedAxisVisibilityFn) =>
	R.when(
		R.both(
			// axisVisibilityObj is not empty and...
			R.pipe(
				R.isEmpty,
				R.not
			),
			// axisVisibilityObj doesn't have an entry for the Item we're adding
			R.pipe(
				R.has(axisIndex),
				R.not
			)
		),
		R.pipe(
			R.thunkify(R.assoc)(axisIndex, true, {}), // make an object like {3: true} (where 3 is the axisIndex)
			updatedAxisVisibilityFn // add that object into the rowVisibility object
		)
	)(axisVisibilityObj);
