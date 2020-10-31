import * as R from 'ramda';
import managedStore from '../store';
import { POSTING_UPDATED_TITLE, COMPLETED_TITLE_UPDATE, TITLE_UPDATE_FAILED } from '../actions/titleTypes';
import { POSTING_CREATE_SHEET, COMPLETED_CREATE_SHEET, SHEET_CREATION_FAILED } from '../actions/sheetTypes';
import { POSTING_UPDATED_METADATA, COMPLETED_SAVE_METADATA, METADATA_UPDATE_FAILED } from '../actions/metadataTypes';
import { TRIGGERED_FETCH_SHEET } from '../actions/fetchSheetTypes';
import { FETCHING_SHEETS } from '../actions/sheetsTypes';
import {
   POSTING_UPDATED_CELLS,
   COMPLETED_SAVE_CELLS,
   COMPLETED_SAVE_CELL_,
   CELLS_UPDATE_FAILED,
   POSTING_DELETE_SUBSHEET_ID_,
   COMPLETED_DELETE_SUBSHEET_ID_,
   DELETE_SUBSHEET_ID_FAILED_,
} from '../actions/cellTypes';
import { updatedCells } from '../actions/cellActions';
import { updateTitleInDB } from '../services/sheetServices';
import { updateMetadataMutation } from '../queries/metadataMutations';
import { updateCellsMutation, deleteSubsheetIdMutation } from '../queries/cellMutations';
import { createSheetMutation } from '../queries/sheetMutations';
import { isSomething } from '../helpers';
import { getUserInfoFromCookie } from '../helpers/userHelpers';
import { getSaveableCellData } from '../helpers/cellHelpers';
import { initializeAxesVisibility } from '../helpers/visibilityHelpers';
import { cellText, cellSubsheetIdSetter, dbSheetId } from '../helpers/dataStructureHelpers';

// note that services/sheetServices.js has a bunch of db operations in it as well.
// they should be not coming via an action....TODO investigate this situation...should they be in here?

const saveParentSheetData = async (parentSheetCell, parentSheetId, newSheet) => {
   const savableParentSheetCell = R.pipe(
      getSaveableCellData,
      R.pipe(dbSheetId, cellSubsheetIdSetter)(newSheet)
   )(parentSheetCell);
   await updatedCells({ sheetId: parentSheetId, cells: [savableParentSheetCell] });
};

const createNewSheet = async ({ userId, rows, columns, title, parentSheetId, summaryCell, parentSheetCell }) => {
   // note calling function must wrap createNewSheet in a try-catch block since we're not doing that here
   const summaryCellText = cellText(parentSheetCell);
   const createSheetResult = await createSheetMutation({
      userId,
      rows,
      columns,
      title,
      parentSheetId,
      summaryCell,
      summaryCellText,
   });
   if (isSomething(parentSheetId)) {
      await saveParentSheetData(parentSheetCell, parentSheetId, createSheetResult);
   }
   return createSheetResult;
};

export default store => next => async action => {
   // TODO need to handle cell types with embedded row & col numbers separately for the moment, until...
   // ....need to refactor the state setup for cells, then can put this stuff into the switch statement
   const postingDeleteSubsheetId = new RegExp(`^${POSTING_DELETE_SUBSHEET_ID_}`, 'ig');
   if (postingDeleteSubsheetId.test(action.type)) {
      next(action); // get this action to the reducer before we do the next steps
      const { row, column, text, sheetId, subsheetId } = action.payload;
      try {
         const response = await deleteSubsheetIdMutation({ sheetId, row, column, text, subsheetId });
         managedStore.store.dispatch({
            type: COMPLETED_DELETE_SUBSHEET_ID_ + row + '_' + column,
            payload: {
               cell: response,
            },
         });
      } catch (err) {
         console.error('Error deleting subsheetId:', err);
         managedStore.store.dispatch({
            type: DELETE_SUBSHEET_ID_FAILED_ + row + '_' + column,
            payload: {
               errorMessage:
                  'did not successfully delete the subsheetId of cell ' + row + ',' + column + 'in the db. err:' + err,
            },
         });
      }
      return;
   }

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
               } /* note that "changeTitle" is the name of the mutation in titleMutation.js */,
            });
         } catch (err) {
            console.error('did not successfully update the title: err:', err);
            managedStore.store.dispatch({
               type: TITLE_UPDATE_FAILED,
               payload: { ...action.payload, errorMessage: 'title was not updated: ' + err },
            });
         }
         break;

      case POSTING_CREATE_SHEET:
         next(action); // get this action to the reducer before we do the next steps
         try {
            const response = await createNewSheet(action.payload);
            managedStore.store.dispatch({
               type: COMPLETED_CREATE_SHEET,
               payload: { sheet: response },
            });
         } catch (err) {
            console.error('did not successfully create the sheet in the db: err:', err);
            managedStore.store.dispatch({
               type: SHEET_CREATION_FAILED,
               payload: { errorMessage: 'sheet was not created in the db: ' + err },
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
            }); //note that "updateMetada" is the name of the mutation in metadataMutation.js
         } catch (err) {
            console.error('Did not successfully update the metadata in the db:', err);
            managedStore.store.dispatch({
               type: METADATA_UPDATE_FAILED,
               payload: { errorMessage: 'metadata was not updated in the db: ' + err },
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
               const type = COMPLETED_SAVE_CELL_ + cell.row + '_' + cell.column;
               managedStore.store.dispatch({ type });
               return null; // no return value needed, putting here to stop a warning from showing in the console
            })(action.payload.cells);
         } catch (err) {
            console.error('did not successfully update the cells in the db: err:', err);
            managedStore.store.dispatch({
               type: CELLS_UPDATE_FAILED,
               payload: { errorMessage: 'cells were not updated in the db: ' + err },
            });
         }
         break;

      case TRIGGERED_FETCH_SHEET:
         next(action); // get this action to the reducer before we do the next steps, so the UI can display "waiting" state
         break;
      // remember: for importing a db operation
      // make sure to get data sent in POSTING_ action
      // next(action) first
      // update the response from the mutation so we don't have to do response.data.someMutationName
      // put break at the end!

      case FETCHING_SHEETS:
         next(action); // get this action to the reducer before we do the next steps, so the UI can display "waiting" state
         // TODO maybe this needs to have teh functionality moved here from sheetServices
         break;

      default:
         return next(action);
   }
};
