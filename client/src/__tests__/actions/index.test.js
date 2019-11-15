import managedStore from '../../store';
import mockSheet from '../../mockSheet2.js';
import {
   fetchedSheet,
   updatedSheetId,
   updateEditor,
   updatedCellBeingEdited,
   updatedCell,
   updatedCellKeys,
   setEditorRef,
   updatedTitle,
   setEditingTitle,
} from '../../actions';

import {
   FETCHED_SHEET,
   UPDATED_SHEET_ID,
   SET_EDITOR_REF,
   UPDATED_TITLE,
   SET_EDITING_TITLE,
   UPDATE_EDITOR,
   UPDATED_CELL_,
   UPDATED_CELL_KEYS,
} from '../../actions/types';

describe('actions', () => {
   it('should create the FETCHED_SHEET action', () => {
      const fetchSheetAction = {
         type: FETCHED_SHEET,
         payload: mockSheet,
      };
      const generatedAction = fetchedSheet(mockSheet);
      expect(generatedAction).toEqual(fetchSheetAction);
   });

   it('should create the SET_EDITOR_REF action', () => {
      const inputData = 'stand in for an editorRef';
      const expectedAction = {
         type: SET_EDITOR_REF,
         payload: inputData,
      };
      expect(setEditorRef(inputData)).toEqual(expectedAction);
   });

   it('should create the UPDATED_TITLE action', () => {
      const inputData = 'new title data';
      const expectedAction = {
         type: UPDATED_TITLE,
         payload: inputData,
      };
      expect(updatedTitle(inputData)).toEqual(expectedAction);
   });

   it('should create the SET_EDITING_TITLE action', () => {
      const inputData = true;
      const expectedAction = {
         type: SET_EDITING_TITLE,
         payload: inputData,
      };
      expect(setEditingTitle(inputData)).toEqual(expectedAction);
   });

   describe('using the managedStore dispatch method', () => {
      let dispatchSpy;
      beforeAll(() => {
         managedStore.init();
         dispatchSpy = jest.spyOn(managedStore.store, 'dispatch');
      });

      it('should create the UPDATED_SHEET_ID action', () => {
         const expectedAction = {
            type: UPDATED_SHEET_ID,
            payload: mockSheet.metadata._id,
         };
         updatedSheetId(mockSheet.metadata._id);
         expect(dispatchSpy).toHaveBeenCalledWith(expectedAction);
      });

      it('should create the UPDATE_EDITOR action', () => {
         const cellData = {
            row: 3,
            column: 2,
            content: 'some cell content',
         };
         const expectedAction = {
            type: UPDATE_EDITOR,
            payload: cellData,
         };
         updateEditor(cellData);
         expect(dispatchSpy).toHaveBeenCalledWith(expectedAction);
      });

      it('should create the UPDATED_CELL_ action', () => {
         const cellData = {
            row: 3,
            column: 2,
            content: 'some cell content',
         };
         const expectedAction = {
            type: UPDATED_CELL_ + cellData.row + '_' + cellData.column,
            payload: cellData.content,
         };
         updatedCell(cellData);
         expect(dispatchSpy).toHaveBeenCalledWith(expectedAction);
      });

      it('should create the UPDATED_CELL_KEYS action', () => {
         const cellKeys = ['cell_0_0', 'cell_0_1', 'cell_1_0', 'cell_1_1'];
         const expectedAction = {
            type: UPDATED_CELL_KEYS,
            payload: cellKeys,
         };
         updatedCellKeys(cellKeys);
         expect(dispatchSpy).toHaveBeenCalledWith(expectedAction);
      });
   });
});
