import * as R from 'ramda';
import managedStore from '../store';
import { POSTING_UPDATED_TITLE, COMPLETED_TITLE_UPDATE, TITLE_UPDATE_FAILED } from '../actions/titleTypes';
import { POSTING_CREATE_SHEET, COMPLETED_CREATE_SHEET, SHEET_CREATION_FAILED } from '../actions/sheetTypes';
import { POSTING_UPDATED_METADATA, COMPLETED_SAVE_METADATA, METADATA_UPDATE_FAILED } from '../actions/metadataTypes';
import { TRIGGERED_FETCH_SHEET } from '../actions/sheetTypes';
import { FETCHING_SHEETS } from '../actions/sheetsTypes';
import {
   POSTING_UPDATED_CELLS,
   COMPLETED_SAVE_CELLS,
   COMPLETED_SAVE_CELL,
   CELLS_UPDATE_FAILED,
   POSTING_DELETE_SUBSHEET_ID,
   COMPLETED_DELETE_SUBSHEET_ID,
   DELETE_SUBSHEET_ID_FAILED,
} from '../actions/cellTypes';
import { updatedCells } from '../actions/cellActions';
import { updateTitleInDB, fetchSheets, saveAllUpdates } from '../services/sheetServices';
import { updateMetadataMutation } from '../queries/metadataMutations';
import { updateCellsMutation, deleteSubsheetIdMutation } from '../queries/cellMutations';
import { createSheetMutation } from '../queries/sheetMutations';
import { isSomething } from '../helpers';
import { getUserInfoFromCookie } from '../helpers/userHelpers';
import { getSaveableCellData } from '../helpers/cellHelpers';
import { createDefaultAxisSizing } from '../helpers/axisSizingHelpers';
import { cellText, cellSubsheetIdSetter, dbSheetId } from '../helpers/dataStructureHelpers';
import { DEFAULT_TOTAL_ROWS, DEFAULT_TOTAL_COLUMNS, DEFAULT_ROW_HEIGHT, DEFAULT_COLUMN_WIDTH } from '../constants';

// note that services/sheetServices.js has a bunch of db operations in it as well.
// they should be not coming via an action....TODO investigate this situation...should they be in here?

const saveParentSheetData = async (parentSheetCell, parentSheetId, newSheet) => {
   const savableParentSheetCell = R.pipe(
      getSaveableCellData,
      R.pipe(dbSheetId, cellSubsheetIdSetter)(newSheet)
   )(parentSheetCell);
   await updatedCells({ sheetId: parentSheetId, cells: [savableParentSheetCell] });
};

const createNewSheet = async ({ userId, rows, columns, title, parentSheetId, parentSheetCell, rowHeights, columnWidths }) => {
   // note calling function must wrap createNewSheet in a try-catch block since we're not doing that here
   rows = rows || DEFAULT_TOTAL_ROWS;
   columns = columns || DEFAULT_TOTAL_COLUMNS
   rowHeights = rowHeights || createDefaultAxisSizing(rows, DEFAULT_ROW_HEIGHT);
   columnWidths = columnWidths || createDefaultAxisSizing(columns, DEFAULT_COLUMN_WIDTH);
   const createSheetResult = await createSheetMutation({
      userId,
      rows,
      columns,
      title,
      parentSheetId,
      rowHeights, 
      columnWidths,
   });
   if (isSomething(parentSheetId)) {
      await saveParentSheetData(parentSheetCell, parentSheetId, createSheetResult);
   }
   return createSheetResult;
};

export default store => next => async action => {
   switch (action.type) {
      case POSTING_UPDATED_TITLE:
         next(action); // get this action to the reducer before we do the next steps
         const { sheetId, text } = action.payload;
         try {
            const data = await updateTitleInDB(sheetId, text);
            managedStore.store.dispatch({
               type: COMPLETED_TITLE_UPDATE,
               payload: {
                  text: data.title,
                  lastUpdated: Date.now(),
               },
            });
            await fetchSheets(); // this will update the sheetsTree in the store, since some sheet in that tree has a new name
         } catch (err) {
            // console.error('did not successfully update the title: err:', err);
            managedStore.store.dispatch({
               type: TITLE_UPDATE_FAILED,
               payload: { ...action.payload, errorMessage: 'title was not updated' },
            });
         }
         break;

      case POSTING_CREATE_SHEET:
         next(action); // get this action to the reducer before we do the next steps
         try {
            await saveAllUpdates(store.getState());
            const response = await createNewSheet(action.payload);
            managedStore.store.dispatch({
               type: COMPLETED_CREATE_SHEET,
               payload: { sheet: response },
            });
            await fetchSheets(); // this will update the sheetsTree in the store, since there's a new sheet to add
         } catch (err) {
            // console.error('did not successfully create the sheet in the db: err:', err);
            managedStore.store.dispatch({
               type: SHEET_CREATION_FAILED,
               payload: { errorMessage: 'sheet was not created in the db' },
            });
         }
         break;

      case POSTING_UPDATED_METADATA:
         next(action); // get this action to the reducer before we do the next steps
         try {
            const { sheetId, changedMetadata } = action.payload;
            const data = await updateMetadataMutation({ ...changedMetadata, id: sheetId });
            managedStore.store.dispatch({
               type: COMPLETED_SAVE_METADATA,
               payload: {
                  updatedMetadata: data,
                  lastUpdated: Date.now(),
               },
            });
         } catch (err) {
            // console.error('Did not successfully update the metadata in the db:', err);
            managedStore.store.dispatch({
               type: METADATA_UPDATE_FAILED,
               payload: { errorMessage: 'metadata was not updated in the db' },
            });
         }
         break;

      case POSTING_UPDATED_CELLS:
         next(action); // get this action to the reducer before we do the next steps, so the UI can display "waiting" state
         try {
            const { userId } = getUserInfoFromCookie();
            const response = await updateCellsMutation({
               ...action.payload, // contains sheetId, cells
               userId,
            });
            managedStore.store.dispatch({
               type: COMPLETED_SAVE_CELLS,
               payload: {
                  updatedCells: response,
                  lastUpdated: Date.now(),
               },
            });
            R.map(cell => {
               managedStore.store.dispatch({
                  type: COMPLETED_SAVE_CELL,
                  payload: { ...cell, sheetId: action.payload.sheetId },
               });
               return null; // no return value needed - putting here to stop a warning from showing in the console
            })(action.payload.cells);
         } catch (err) {
            console.error('dbOperations tried to update cells but failed');
            managedStore.store.dispatch({
               type: CELLS_UPDATE_FAILED,
               payload: { errorMessage: 'cells were not updated in the db'}, // don't publish the exact error, err for security reasons
            });
         }
         break;

      case POSTING_DELETE_SUBSHEET_ID:
         next(action); // get this action to the reducer before we do the next steps, so the UI can display "waiting" state
         try {
            const response = await deleteSubsheetIdMutation(action.payload); // action.payload contains { row, column, text, sheetId, subsheetId }
            managedStore.store.dispatch({
               type: COMPLETED_DELETE_SUBSHEET_ID,
               payload: response,
            });
            await fetchSheets(); // this will update the sheetsTree in the store, since a sheet has been unlinked from its parent
         } catch (err) {
            // console.error('Error deleting subsheetId:', err);
            managedStore.store.dispatch({
               type: DELETE_SUBSHEET_ID_FAILED,
               payload: {
                  ...action.payload,
                  errorMessage:
                     'did not successfully delete the subsheetId of a cell in the db.',
               },
            });
         }
         break;

      case TRIGGERED_FETCH_SHEET:
         next(action); // get this action to the reducer before we do the next steps, so the UI can display "waiting" state
         break;

      case FETCHING_SHEETS:
         next(action); // get this action to the reducer before we do the next steps, so the UI can display "waiting" state
         // TODO maybe this needs to have teh functionality moved here from sheetServices
         break;

      default:
         return next(action);
   }
};
