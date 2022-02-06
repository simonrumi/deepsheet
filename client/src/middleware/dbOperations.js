import * as R from 'ramda';
import managedStore from '../store';
import { log } from '../clientLogger';
import { LOG } from '../constants';
import { POSTING_CREATE_SHEET, COMPLETED_CREATE_SHEET, SHEET_CREATION_FAILED } from '../actions/sheetTypes';
import { POSTING_UPDATED_METADATA, COMPLETED_SAVE_METADATA, METADATA_UPDATE_FAILED } from '../actions/metadataTypes';
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
import { fetchSheets, saveAllUpdates } from '../services/sheetServices';
import { updateMetadataMutation } from '../queries/metadataMutations';
import { updateCellsMutation, deleteSubsheetIdMutation } from '../queries/cellMutations';
import { createSheetMutation } from '../queries/sheetMutations';
import { isSomething, arrayContainsSomething, ifThenElse } from '../helpers';
import { getUserInfoFromCookie } from '../helpers/userHelpers';
import { getSaveableCellData } from '../helpers/cellHelpers';
import { createDefaultAxisSizing } from '../helpers/axisSizingHelpers';
import { cellSubsheetIdSetter, cellTextSetter, dbSheetId, removeTypename } from '../helpers/dataStructureHelpers';
import { DEFAULT_TOTAL_ROWS, DEFAULT_TOTAL_COLUMNS, DEFAULT_ROW_HEIGHT, DEFAULT_COLUMN_WIDTH } from '../constants';
import { DEFAULT_TITLE_FOR_SUBSHEET_FROM_CELL_RANGE } from '../components/displayText';

const saveParentSheetData = async ({ parentSheetCell, parentSheetId, newSheet, cellRange }) => {
   const parentCellWithSubsheetId = R.pipe(
      getSaveableCellData,
      R.pipe(dbSheetId, cellSubsheetIdSetter)(newSheet),
   )(parentSheetCell);
   const savableParentSheetCell = ifThenElse({
      ifCond: arrayContainsSomething, thenDo: cellTextSetter, elseDo: R.identity,
      params: { 
         ifParams: [cellRange],
         thenParams: [ DEFAULT_TITLE_FOR_SUBSHEET_FROM_CELL_RANGE, parentCellWithSubsheetId ],
         elseParams: parentCellWithSubsheetId
      }
   });
   await updatedCells({ sheetId: parentSheetId, cells: [savableParentSheetCell] });
};

const createNewSheet = async ({
   userId,
   rows,
   columns,
   title,
   parentSheetId,
   parentSheetCell,
   rowHeights,
   columnWidths,
   cellRange,
}) => {
   // note calling function must wrap createNewSheet in a try-catch block since we're not doing that here
   rows = rows || DEFAULT_TOTAL_ROWS;
   columns = columns || DEFAULT_TOTAL_COLUMNS;
   rowHeights = rowHeights || createDefaultAxisSizing(rows, DEFAULT_ROW_HEIGHT);
   columnWidths = columnWidths || createDefaultAxisSizing(columns, DEFAULT_COLUMN_WIDTH);
   cellRange = cellRange || [];
   const createSheetResult = await createSheetMutation({
      userId,
      rows,
      columns,
      title,
      parentSheetId,
      rowHeights,
      columnWidths,
      cellRange
   });
   if (isSomething(parentSheetId)) {
      await saveParentSheetData({ parentSheetCell, parentSheetId, newSheet: createSheetResult, cellRange });
   }
   return createSheetResult;
};

const dbOperations = store => next => async action => {
   switch (action.type) {
      case POSTING_CREATE_SHEET:
         next(action); // get this action to the reducer before we do the next steps
			const cleanedCreateSheetData = removeTypename(action.payload);
         try {
            await saveAllUpdates(store.getState());
            const response = await createNewSheet(cleanedCreateSheetData);
            managedStore.store.dispatch({
               type: COMPLETED_CREATE_SHEET,
               payload: { sheet: response },
            });
            await fetchSheets(); // this will update the sheetsTree in the store, since there's a new sheet to add
         } catch (err) {
            log({ level: LOG.INFO }, 'did not successfully create the sheet in the db:', err);
            managedStore.store.dispatch({
               type: SHEET_CREATION_FAILED,
               payload: { errorMessage: 'sheet was not created in the db'},
            });
         }
         break;

      case POSTING_UPDATED_METADATA:
         next(action); // get this action to the reducer before we do the next steps
         try {
            const { sheetId, changedMetadata } = action.payload;
				const cleanChangedMetadata = removeTypename(changedMetadata);
            const data = await updateMetadataMutation({ ...cleanChangedMetadata, id: sheetId });
            managedStore.store.dispatch({
               type: COMPLETED_SAVE_METADATA,
               payload: {
                  updatedMetadata: data,
                  lastUpdated: Date.now(),
               },
            });
         } catch (err) {
            log({ level: LOG.INFO }, 'Did not successfully update the metadata in the db:', err);
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
				const cleanedCells = removeTypename(action.payload); // contains sheetId as well as cells
            const response = await updateCellsMutation({
               ...cleanedCells, 
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
            log({ level: LOG.INFO }, 'dbOperations tried to update cells but failed', err);
            managedStore.store.dispatch({
               type: CELLS_UPDATE_FAILED,
               payload: { errorMessage: 'cells were not updated in the db'}, // don't publish the exact error, err for security reasons
            });
         }
         break;

      case POSTING_DELETE_SUBSHEET_ID:
         next(action); // get this action to the reducer before we do the next steps, so the UI can display "waiting" state
         try {
				const cleanedData = removeTypename(action.payload); // action.payload contains { row, column, text, sheetId, subsheetId }
            const response = await deleteSubsheetIdMutation(cleanedData); 
            managedStore.store.dispatch({
               type: COMPLETED_DELETE_SUBSHEET_ID,
               payload: response,
            });
            await fetchSheets(); // this will update the sheetsTree in the store, since a sheet has been unlinked from its parent
         } catch (err) {
            log({ level: LOG.INFO }, 'Error deleting subsheetId:', err);
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

      default:
         return next(action);
   }
};

export default dbOperations;