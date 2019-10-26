import { staticReducers } from '../../reducers';
import mockSheet from '../../mockSheet2';
import {
   DEFAULT_SHEET_ID,
   UPDATED_SHEET_ID,
   FETCHED_SHEET,
   UPDATE_EDITOR,
   SET_EDITOR_REF,
   UPDATED_TITLE,
   SET_EDITING_TITLE,
} from '../../actions/types';

describe('reducers', () => {
   const initialState = {
      sheetId: 5,
      sheet: [],
   };

   const sheetIdReducer = staticReducers.sheetId;
   const sheetReducer = staticReducers.sheet;

   it('sheetIdReducer should update sheetId in the state', () => {
      const newSheetId = 99;
      const updatedSheetIdAction = {
         type: UPDATED_SHEET_ID,
         payload: newSheetId,
      };
      const newState = sheetIdReducer(initialState, updatedSheetIdAction);
      expect(newState).toEqual(newSheetId);
   });

   it('sheetIdReducer should return the default sheet id when the type is not UPDATED_SHEET_ID', () => {
      const newState = sheetIdReducer(undefined, {});
      expect(newState).toEqual(DEFAULT_SHEET_ID);
   });

   it('sheetReducer should update sheet in the state', () => {
      console.log('sheetReducer', sheetReducer);
      const sheetAction = {
         type: FETCHED_SHEET,
         payload: mockSheet,
      };
      const newState = sheetReducer(initialState, sheetAction);
      expect(newState).toEqual(mockSheet.metadata);
   });
});
