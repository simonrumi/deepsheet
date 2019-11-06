import managedStore from '../../store';
import mockSheet from '../../mockSheet2';
import {
   cellReducerFactory,
   createCellReducers,
   removeCellReducers,
   cellKeyReducer,
   populateCellsInStore,
} from '../../reducers/cellReducers';
import { UPDATED_CELL_, UPDATED_CELL_KEYS } from '../../actions/types';

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
   });

   describe('cellReducerFactory', () => {
      it('should return a function to update a specific cell, and that function should return the cells new content', () => {
         const newContent = 'some new cell content';
         const cellFn = cellReducerFactory(row, col);
         const cellAction = {
            type: UPDATED_CELL_ + row + '_' + col,
            payload: newContent,
         };
         expect(cellFn(state, cellAction)).toEqual(newContent);
      });
   });

   describe('cellKeyReducer', () => {
      it('should return and updated state with an array of the names of the cell reducers', () => {
         const cellKeys = ['cell_0_0', 'cell_3_4'];
         const updatedCellKeysAction = {
            type: UPDATED_CELL_KEYS,
            payload: cellKeys,
         };
         const newState = cellKeyReducer({}, updatedCellKeysAction);
         expect(newState).toEqual(cellKeys);
      });

      it('should add an array of the names of the cell reducers to the store, when triggered by the store action', () => {
         const cellKeys = ['cell_0_0', 'cell_3_4'];
         const updatedCellKeysAction = {
            type: UPDATED_CELL_KEYS,
            payload: cellKeys,
         };
         managedStore.store.dispatch(updatedCellKeysAction);
         expect(managedStore.state.cellKeys).toEqual(cellKeys);
      });
   });

   describe('createCellReducers', () => {
      it('should place all the cell reducers in the store', () => {
         createCellReducers({ totalRows: 4, totalColumns: 5 });
         const newContent = 'new content for cell (3,4)';
         const cellAction = {
            type: UPDATED_CELL_ + '3_4',
            payload: newContent,
         };
         const cellReducers = managedStore.store.reducerManager.getReducerMap();
         expect(cellReducers['cell_3_4'] instanceof Function).toBe(true);
         expect(cellReducers['cell_3_4'](state, cellAction)).toEqual(
            newContent
         );
      });
   });

   describe('populateCellsInStore', () => {
      it('should update all the cells with content from the sheet data', () => {
         const dispatchSpy = jest.spyOn(managedStore.store, 'dispatch');
         populateCellsInStore(mockSheet);
         expect(dispatchSpy).toHaveBeenCalledTimes(12);
         // spot check the first cell
         expect(managedStore.state['cell_0_0']).toBeDefined();
         expect(managedStore.state['cell_0_0']).toEqual(
            mockSheet.rows[0].columns[0].content
         );
      });
   });
});
