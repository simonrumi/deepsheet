import * as R from 'ramda';
import managedStore from '../store';
import { log } from '../clientLogger';
import { LOG } from '../constants';
import { completedSaveUpdates } from '../actions';
import { triggeredFetchSheet } from '../actions/sheetActions';
import { updatedCells, clearedAllCellKeys } from '../actions/cellActions';
import { clearedFocus } from '../actions/focusActions';
import { clearedCellRange } from '../actions/cellRangeActions';
import { updatedMetadata, clearMetadata } from '../actions/metadataActions';
import {
   fetchingSheets,
   fetchedSheets,
   fetchSheetsError,
   deletingSheet,
   deletedSheet,
   deleteSheetError,
   deletingSheets,
   deletedSheets,
   deleteSheetsError,
} from '../actions/sheetsActions';
import { postingUpdatedTitle, finishedEditingTitle } from '../actions/titleActions';
import { updatedSheetsTree } from '../actions/sheetsActions';
import { COMPLETED_TITLE_UPDATE, TITLE_UPDATE_FAILED } from '../actions/titleTypes';
import { clearCells, decodeText } from '../helpers/cellHelpers';
import { createSheetsTreeFromArray } from '../helpers/sheetsHelpers';
import { updateCellsInRange } from '../helpers/rangeToolHelpers';
import { isSomething, arrayContainsSomething, ifThen } from '../helpers';
import { getSaveableCellData, getCellFromStore } from '../helpers/cellHelpers';
import { getUserInfoFromCookie } from '../helpers/userHelpers';
import {
   stateChangedCells,
   stateSheetId,
   stateMetadataIsStale,
   saveableStateMetadata,
   stateTitleIsStale,
   stateTitleText,
   stateSheets,
   stateFocusAbortControl,
} from '../helpers/dataStructureHelpers';
import { sheetQuery, sheetsQuery } from '../queries/sheetQueries';
import { deleteSheetsMutation, deleteSheetMutation, sheetByUserIdMutation } from '../queries/sheetMutations';
import titleMutation from '../queries/titleMutation';


// TODO return the response.data.thing for each query/mutation so the consumer doesn;t have to know that path

export const fetchSheet = async (sheetId, userId) => {
   const confirmedUserId = isSomething(userId) 
      ? userId 
      : R.pipe(
         getUserInfoFromCookie, 
         R.prop('userId')
      )();

   try {
      const sheet = await sheetQuery(sheetId, confirmedUserId);
      return sheet;
   } catch (err) {
      console.error('error fetching sheet');
   }
};

export const fetchSheetByUserId = async userId => {
   try {
      const sheetByUserId = await sheetByUserIdMutation(userId);
      return sheetByUserId;
   } catch (err) {
      throw new Error('error fetching sheet by user id: ' + err);
   }
};

export const fetchSheets = async () => {
   const { userId } = getUserInfoFromCookie();
   fetchingSheets();
   try {
      const response = await sheetsQuery(userId);
      fetchedSheets(response.data.sheets);
      const sheetsArr = stateSheets(managedStore.state);
      if (arrayContainsSomething(sheetsArr)) {
         const sheetsTree = createSheetsTreeFromArray(sheetsArr);
         updatedSheetsTree(sheetsTree);
      }
   } catch (err) {
      console.error('error fetching sheets:', err);
      fetchSheetsError(err);
   }
};

export const deleteSheets = async (sheetIds, userId) => {
   deletingSheets();
   try {
      const remainingSheets = await deleteSheetsMutation(sheetIds, userId);
      deletedSheets(remainingSheets);
   } catch (err) {
      console.error('error deleting sheets:', err);
      deleteSheetsError(err);
   }
};

export const deleteSheet = async (sheetId, userId) => {
   deletingSheet();
   try {
      const remainingSheets = await deleteSheetMutation(sheetId, userId);
      deletedSheet(remainingSheets);
   } catch (err) {
      console.error('error deleting sheet:', err);
      deleteSheetError(err);
   }
};

const updateTitleInDB = async ({id, title}) => {
   const data = await titleMutation(id, title);
   const decodedText = decodeText(data.title);
   managedStore.store.dispatch({
      type: COMPLETED_TITLE_UPDATE,
      payload: {
         text: decodedText,
         lastUpdated: Date.now(),
      },
   });
};

const saveTitleUpdate = async state => {
   if (stateTitleIsStale(state)) {
      const sheetId = stateSheetId(state);
      const text = stateTitleText(state);
      postingUpdatedTitle({ sheetId, text });
      try {
         await updateTitleInDB({ id: sheetId, title: text });
         await fetchSheets(); // this will update the sheetsTree in the store, since some sheet in that tree has a new name
      } catch (err) {
         managedStore.store.dispatch({
            type: TITLE_UPDATE_FAILED,
            payload: { errorMessage: 'title was not updated: ' + err },
         });
         finishedEditingTitle(decodeText(text)); // even though the db update failed, the title has been changed locally
         log({ level: LOG.INFO }, 'error updating title in db', err);
      }
      
   }
}

const getUpdatedCells = R.curry((state, updatedCellCoordinates) => {
   if (isSomething(updatedCellCoordinates) && arrayContainsSomething(updatedCellCoordinates)) {
      return R.map(({ row, column }) => {
         const cellData = getCellFromStore({ row, column, state });
         return getSaveableCellData(cellData);
      })(updatedCellCoordinates);
   }
   return null;
});

const getChangedCells = state => R.pipe(stateChangedCells, getUpdatedCells(state))(state);

const saveCellUpdates = async state => {
   const changedCells = getChangedCells(state);
   const sheetId = stateSheetId(state);
   if (changedCells) {
      try {
         await updatedCells({ sheetId, cells: changedCells }); // note the "await" here doesn't do much because it is just triggering the action, which completes immediately. That action doesn't wait for the db update to happen
      } catch (err) {
         console.error('Error updating cells in db');
         throw new Error('Error updating cells in db', err);
      }
   }
};

const getChangedMetadata = state => (stateMetadataIsStale(state) ? saveableStateMetadata(state) : null);

const saveMetadataUpdates = async state => {
   const changedMetadata = getChangedMetadata(state);
   if (changedMetadata) {
      try {
         const sheetId = stateSheetId(state);
         await updatedMetadata({ sheetId, changedMetadata });
      } catch (err) {
         console.error('Error updating metadata in db');
         throw new Error('Error updating metadata in db', err);
      }
   }
};

export const saveAllUpdates = async state => {
   // TODO we are calling these updates serially -- yeech!
   await saveMetadataUpdates(state);
   await saveCellUpdates(state);
   await saveTitleUpdate(state);
   completedSaveUpdates(); // only gets here if there's no error thrown
};

export const loadSheet = R.curry(async (state, sheetId) => {
   ifThen({
      ifCond: R.pipe(stateFocusAbortControl, isSomething),
      thenDo: () => stateFocusAbortControl(state).abort(),
      params: { ifParams: state }
   }); // clears keydown listeners if any cell has focus
   await saveAllUpdates(state); // save any changes to the current sheet
   clearCells(state); // clear out the current sheet's cells and cell keys
   clearMetadata();
   clearedAllCellKeys();
   clearedFocus(); // make sure no cells are focused
	updateCellsInRange(false); // false means we want to remove all the cells from the range
	clearedCellRange();
   triggeredFetchSheet(sheetId); // then get the new sheet
});
