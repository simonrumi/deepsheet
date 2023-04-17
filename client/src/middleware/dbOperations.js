import * as R from 'ramda';
import managedStore from '../store';
import { log } from '../clientLogger';
import { LOG } from '../constants';
import { POSTING_CREATE_SHEET, COMPLETED_CREATE_SHEET, SHEET_CREATION_FAILED, FETCHED_SHEET, } from '../actions/sheetTypes';
import { POSTING_UPDATED_METADATA, COMPLETED_SAVE_METADATA, METADATA_UPDATE_FAILED } from '../actions/metadataTypes';
import {
   POSTING_UPDATED_CELLS,
	POSTING_DELETED_CELLS,
   POSTING_DELETE_SUBSHEET_ID,
   COMPLETED_DELETE_SUBSHEET_ID,
   DELETE_SUBSHEET_ID_FAILED,
	COMPLETED_SAVE_CELLS,
	COMPLETED_DELETE_CELLS,
	UPDATE_CELLS_FAILED,
	DELETE_CELLS_FAILED,
} from '../actions/cellTypes';
import { updatedCellsAction, completedSaveCells, completedSaveCell, updateCellsFailed, deleteCellsFailed } from '../actions/cellActions';
import { completedSaveFloatingCell, } from '../actions/floatingCellActions';
import { fetchSheets, saveAllUpdates } from '../services/sheetServices';
import { updateMetadataMutation } from '../queries/metadataMutations';
import { updateCellsMutation, deleteSubsheetIdMutation, deleteCellsMutation, } from '../queries/cellMutations';
import { createSheetMutation } from '../queries/sheetMutations';
import { isSomething, arrayContainsSomething, ifThenElse } from '../helpers';
import { getUserInfoFromCookie } from '../helpers/userHelpers';
import { getSaveableCellData, cleanCell } from '../helpers/cellHelpers';
import { createDefaultAxisSizing } from '../helpers/axisSizingHelpers';
import {
   cellSubsheetIdSetter,
   cellTextSetter,
   dbSheetId,
   removeTypename,
   stateCellDbUpdatesIsCallingDb,
} from '../helpers/dataStructureHelpers';
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
   await updatedCellsAction({ sheetId: parentSheetId, cells: [savableParentSheetCell] });
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

let cellDbUpdateListeners = [];

const notifyCellDbUpdate = isCallingDb => {
	R.forEach(
		listenerObj => {
			listenerObj.callback(isCallingDb)
		}, 
		cellDbUpdateListeners
	);
	cellDbUpdateListeners = []; // having notified all the listeners once, we now remove them // TODO if this works, then we don't need the ID for each listener
}

const addCellDbUpdateListener = callback => {
	const id = cellDbUpdateListeners.length; // make the id for the listener the index that it will be given when pushed onto the array
	const listenerObj = { callback, id }
	cellDbUpdateListeners.push(listenerObj);
	console.log('dbOperations--addCellDbUpdateListener added a callback to the cellDbUpdateListeners with the id', id);
	return id;
}

// const removeCellDbUpdateListener = id => cellDbUpdateListeners = R.filter(listenerObj => id !== listenerObj.id, cellDbUpdateListeners); // TODO might not need this TIDY

const maybeWaitForDbCall = callback => {
	// TODO NEXT
	// dbOperations doesn't get called until after sheetServices has sent the POSTING_UPDATED_CELLS action, so isCallingDb is already true
	// that means that we are waiting for the updatedCells mutation to finish, even though we haven't started it
	// so we probably need to know the type of call we're waiting for and then only wait if it is not the same as the call we're about to make
	// ....perhaps this means that we should not be checking  stateCellDbUpdatesIsCallingDb(), but we should check that type instead
	// ...OR instead of all that maybe we should be using the listener IDs to figure out specifically whether we're waiting for our own callback or not
	if (stateCellDbUpdatesIsCallingDb(managedStore.state)) {
		console.log('dbOperations--maybeWaitForDbCall will be adding a callback to the cellDbUpdateListeners');
		addCellDbUpdateListener(isCallingDb => callback(isCallingDb));
		return;
	}
	console.log('dbOperations--maybeWaitForDbCall did not need to wait, so is immediately running the callback');
	callback(false); // ie isCallingDb = false in this circumstance
}

const dbOperations = store => next => async action => {
   switch (action.type) {
      case POSTING_CREATE_SHEET:
         next(action); // get this action to the reducer before we do the next steps
			const cleanedCreateSheetData = R.pipe(
				R.prop('payload'),
				removeTypename,
				cleanedData => R.prop('cellRange', cleanedData) || [],
				R.map(cell => cleanCell(cell)),
				R.assoc('cellRange', R.__, action.payload),
			)(action);

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
				// TODO make this and all other managedStore.store.dispatches into actions 
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
			console.log('dbOperations--POSTING_UPDATED_CELLS started');
			maybeWaitForDbCall(async isCallingDb => {
				console.log('dbOperations--POSTING_UPDATED_CELLS inside the callback');
				try {
					const { userId } = getUserInfoFromCookie();
					const { cells, floatingCells, sheetId } = action.payload;
					const cleanedCells = R.map(cell => cleanCell(cell))(cells);
					const cleanedFloatingCells = R.map(floatingCell => cleanCell(floatingCell))(floatingCells);
					const response = await updateCellsMutation({
						cells: cleanedCells,
						floatingCells: cleanedFloatingCells,
						sheetId, 
						userId,
					});

					completedSaveCells({ updatedCells: response, lastUpdated: Date.now() }); // note that this will update the cellDbUpdatesReducer which is handled in cellReducers.js not in floatingCellReducers.js 
					R.map(cell => {
						completedSaveCell({ ...cell, sheetId });
						return null; // no return value needed - putting here to stop a warning from showing in the console
					})(cells);

					R.map(floatingCell => { 
						completedSaveFloatingCell({ ...floatingCell, sheetId });
						return null; // no return value needed - putting here to stop a warning from showing in the console
					})(floatingCells);

				} catch (err) {
					log({ level: LOG.ERROR }, 'dbOperations tried to update cells but failed', err);
					updateCellsFailed();
				}
			});
         break;

		case POSTING_DELETED_CELLS:
			next(action); // get this action to the reducer before we do the next steps, so the UI can display "waiting" state
			console.log('dbOperations--POSTING_DELETED_CELLS started');
			maybeWaitForDbCall(async isCallingDb => {
				console.log('dbOperations--POSTING_DELETED_CELLS inside the callback');
				try {
					const { userId } = getUserInfoFromCookie();
					const { cells = [], floatingCells = [], sheetId } = action.payload;
					console.log('dbOperations--POSTING_DELETED_CELLS got sheetId', sheetId, 'cells', cells, 'floatingCells', floatingCells);
					await deleteCellsMutation({ cells, floatingCells, sheetId, userId, });
					completedSaveCells({ lastUpdated: Date.now() });
				} catch(err) {
					log({ level: LOG.ERROR }, 'dbOperations tried to delete cells but failed', err);
					deleteCellsFailed();
				}
			});
			break;

      case POSTING_DELETE_SUBSHEET_ID:
         next(action); // get this action to the reducer before we do the next steps, so the UI can display "waiting" state
         try {
				const cleanedData = cleanCell(action.payload); // action.payload contains { row, column, sheetId, content: { formattedText, subsheetId } };
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

		case COMPLETED_CREATE_SHEET:
		case FETCHED_SHEET:
		case COMPLETED_SAVE_CELLS:
		case COMPLETED_DELETE_CELLS:
		case UPDATE_CELLS_FAILED:
		case DELETE_CELLS_FAILED:
			notifyCellDbUpdate(false); // meaning isCallingDb = false
			return next(action);

      default:
         return next(action);
   }
};

export default dbOperations;