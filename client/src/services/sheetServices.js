import * as R from 'ramda';
import { completedSaveUpdates } from '../actions';
import { triggeredFetchSheet } from '../actions/sheetActions';
import { updatedCells, clearedAllCellKeys } from '../actions/cellActions';
import { clearCells } from '../helpers/cellHelpers';
import { updatedMetadata } from '../actions/metadataActions';
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
import { sheetQuery, sheetsQuery } from '../queries/sheetQueries';
import { deleteSheetsMutation, deleteSheetMutation, sheetByUserIdMutation } from '../queries/sheetMutations';
import titleMutation from '../queries/titleMutation';
import { isSomething, arrayContainsSomething } from '../helpers';
import { getSaveableCellData, getCellFromStore } from '../helpers/cellHelpers';
import { getUserInfoFromCookie } from '../helpers/userHelpers';
import {
   stateChangedCells,
   stateSheetId,
   stateMetadataIsStale,
   saveableStateMetadata,
   stateTitleIsStale,
   stateTitleText,
} from '../helpers/dataStructureHelpers';

// TODO return the response.data.thing for each query/mutation so the consumer doesn;t have to know that path

export const fetchSheet = async (sheetId, userId) => {
   userId = userId || getUserInfoFromCookie();
   try {
      const sheet = await sheetQuery(sheetId, userId);
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
      // TODO - if the deleted sheet is the current sheet then load a new sheet
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

export const updateTitleInDB = async (id, title) => {
   return await titleMutation(id, title);
};

const saveTitleUpdate = async state => {
   if (stateTitleIsStale(state)) {
      try {
         const sheetId = stateSheetId(state);
         const titleText = stateTitleText(state);
         await updateTitleInDB(sheetId, titleText);
      } catch (err) {
         console.error('error updating title in db');
         throw new Error('Error updating title in db', err);
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

export const saveCellUpdates = async state => {
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

export const saveMetadataUpdates = async state => {
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
   // TODO we are calling saveMetadataUpdates & saveCellUpdates serially -- yeech!
   await saveMetadataUpdates(state);
   await saveCellUpdates(state);
   await saveTitleUpdate(state);
   completedSaveUpdates(); // only gets here if there's no error thrown
};

export const loadSheet = R.curry(async (state, sheetId) => {
   saveAllUpdates(state); // save any changes to the current sheet
   clearCells(state); // clear out the current sheet's cells and cell keys
   clearedAllCellKeys();
   triggeredFetchSheet(sheetId); // then get the new sheet
});
