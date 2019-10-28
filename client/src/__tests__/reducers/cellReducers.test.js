import managedStore from '../../store';
import { cellReducerFactory, createCellReducers } from '../../reducers/cellReducers';
import { UPDATED_CELL_ } from '../../actions/types';

// TODO: BUG -
// 1. click cell to edit
// 2. make some changes to the cell
// 3. click summary cell to go to lower layer
// result: error in console about unexpected cell reducers

// QQQ createCellReducers doesn't actally add cellReducers to the store

describe('cellReducers', () => {
	const row = 1;
	const col = 2;
	const state = {
		metadata: {
			row: row,
			column: col,
		},
		content: 'original cell content',
	};
	const actionType = 'update_cell_' + row + '_' + col;

	beforeAll(() => {
		managedStore.init();
		//dispatchSpy = jest.spyOn(managedStore.store, 'dispatch');
	});

	it('cellReducerFactory should return a function to update a specific cell, and that function should return the cells new content', () => {
		const newContent = 'some new cell content';
		const cellFn = cellReducerFactory(row, col);
		const cellAction = { type: UPDATED_CELL_ + row + '_' + col, payload: newContent };
		expect(cellFn(state, cellAction)).toEqual(newContent);
	});

	it('createCellReducers should place all the cell reducers in the store', () => {
		debugger;
		createCellReducers({ totalRows: 4, totalColumns: 5 });
		const newContent = 'new content for cell (3,4)';
		const cellAction = { type: UPDATED_CELL_ + '3_4', payload: newContent };
		const cellReducers = managedStore.store.reducerManager.getReducerMap();

		expect(cellReducers['cell_3_4'] instanceof Function).toBe(true);
		expect(cellReducers['cell_3_4'](state, cellAction)).toEqual(newContent); // this works, but should the below one work?
		expect(managedStore.store.dispatch(cellAction)).toEqual(newContent); // QQQ should this work?
		expect(managedStore.store.reducerManager.reduce(state, cellAction)).toEqual(newContent); // QQQ should this work?
	});
});
