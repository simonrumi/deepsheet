import * as R from 'ramda';
import { UPDATED_ROW_ORDER, UPDATED_CELL_, ROW_MOVED, ROW_MOVED_TO } from '../actions/types';
import moveRow from '../services/moveRow';
import { nothing } from '../helpers';

export default store => next => action => {
	if (!action) {
		return;
	}

	const runDispatches = R.map(async cell => {
		try {
			const promisedDispatch = await store.dispatch({
				type: UPDATED_CELL_ + cell.row + '_' + cell.column,
				payload: cell,
			});
			clearMoveData();
			return await promisedDispatch;
		} catch (err) {
			console.log('Error in orderSheet.runDispatches', err);
		}
	});

	const clearMoveData = () => {
		store.dispatch({
			type: ROW_MOVED,
			payload: null,
		});
		store.dispatch({
			type: ROW_MOVED_TO,
			payload: null,
		});
	};

	switch (action.type) {
		case UPDATED_ROW_ORDER:
			const state = store.getState();
			const updatedCells = R.ifElse(
				R.both(
					R.pipe(
						R.prop('rowMoved'),
						R.isNil,
						R.not
					),
					R.pipe(
						R.prop('rowMovedTo'),
						R.isNil,
						R.not
					)
				),
				R.thunkify(moveRow)(state),
				nothing
			)(state.sheet);
			console.log('updatedCells', updatedCells);
			// Note: if moveRow() returns an array then we get an error when trying to runDispatches() on it.
			// Instead here moveRow() returns an object which we convert to an array with R.values() ...and it works fine
			// Is this a Ramda bug?
			const dispatches = runDispatches(R.values(updatedCells));
			console.log('dispatches', dispatches);
			break;
		default:
	}
	return next(action);
};
