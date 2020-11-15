import * as R from 'ramda';
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
} from '../helpers/dataStructureHelpers';

// TODO return the response.data.thing for each query/mutation so the consumer doesn;t have to know that path

export const fetchSheet = async (sheetId, userId) => {
   console.log('sheetServices fetchSheet started with sheetId', sheetId, 'userId', userId);
   userId = userId || getUserInfoFromCookie();
   try {
      const response = await sheetQuery(sheetId, userId);
      console.log('sheetServices fetchSheet got response.data.sheet', response.data.sheet);
      return response.data.sheet;
   } catch (err) {
      console.error('error in sheetServices.fetchSheet', err);
   }
};

export const fetchSheetByUserId = async userId => {
   console.log('sheetServices.fetchSheetByUserId got userId', userId);
   try {
      const sheetByUserId = await sheetByUserIdMutation(userId);
      console.log('sheetServices.fetchSheetByUserId got sheetByUserId', sheetByUserId);
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
         await updatedCells({ sheetId, cells: changedCells });
      } catch (err) {
         console.error('Error updating cells in db', err);
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
         console.error('Error updating metadata in db', err);
         throw new Error('Error updating metadata in db', err);
      }
   }
};

export const saveAllUpdates = async state => {
   console.log('TODO sheetServices.saveAllUpdates is calling saveMetadataUpdates & saveCellUpdates serially -- yeech!');
   await saveMetadataUpdates(state);
   await saveCellUpdates(state);
};

export const loadSheet = R.curry(async (state, sheetId) => {
   saveAllUpdates(state); // save any changes to the current sheet
   clearCells(state); // clear out the current sheet's cells and cell keys
   clearedAllCellKeys();
   triggeredFetchSheet(sheetId); // then get the new sheet
});
