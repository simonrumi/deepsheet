import * as R from 'ramda';
import managedStore from '../store';
import { log } from '../clientLogger';
import { LOG } from '../constants';
import { completedSaveUpdates } from '../actions';
import { triggeredFetchSheet } from '../actions/sheetActions';
import { updatedCellsAction, deletedCellsAction, clearedAllCellKeys } from '../actions/cellActions';
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
import { isNothing, isSomething, arrayContainsSomething, ifThen } from '../helpers';
import { getSaveableCellData, getCellFromStore } from '../helpers/cellHelpers';
import { getSaveableFloatingCellData } from '../helpers/floatingCellHelpers';
import { getFloatingCellFromStore } from '../helpers/floatingCellHelpers';
import { getUserInfoFromCookie } from '../helpers/userHelpers';
import {
   stateChangedCells,
	stateAddedCells,
	stateDeletedCells,
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
import { editedTitleMessage } from '../components/displayText';

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
		log({ level: LOG.ERROR }, 'error fetching sheet');
		log({ level: LOG.DEBUG }, 'error fetching sheet', err);
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
		log({ level: LOG.ERROR }, 'error fetching sheets');
		log({ level: LOG.DEBUG }, 'error fetching sheets', err);
      fetchSheetsError(err);
   }
};

export const deleteSheets = async (sheetIds, userId) => {
   deletingSheets();
   try {
      const remainingSheets = await deleteSheetsMutation(sheetIds, userId);
      deletedSheets(remainingSheets);
   } catch (err) {
		log({ level: LOG.ERROR }, 'error deleting sheets');
		log({ level: LOG.DEBUG }, 'error deleting sheets', err);
      deleteSheetsError(err);
   }
};

export const deleteSheet = async (sheetId, userId) => {
   deletingSheet();
   try {
      const remainingSheets = await deleteSheetMutation(sheetId, userId);
      deletedSheet(remainingSheets);
   } catch (err) {
		log({ level: LOG.ERROR }, 'error deleting sheet');
		log({ level: LOG.DEBUG }, 'error deleting sheet', err);
      deleteSheetError(err);
   }
};

const updateTitleInDB = async ({ id, title }) => {
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
            payload: { errorMessage: 'title could not be updated' },
         });
         finishedEditingTitle({ value: decodeText(text), message: editedTitleMessage(), }); // even though the db update failed, the title has been changed locally
         log({ level: LOG.ERROR }, 'error updating title in db', err);
      }
      
   }
}

const removeDeletedCells = R.curry((deletedCells, cellArr) => R.filter(
	cell => isSomething(cell.number)
		? R.pipe(
			R.find(deletedCell => isSomething(deletedCell.number) && cell.number === deletedCell.number),
			isNothing
		)(deletedCells)
		: R.pipe(
			R.find(deletedCell => isSomething(deletedCell.row) && cell.row === deletedCell.row && cell.column === deletedCell.column),
			isNothing
		)(deletedCells),
	cellArr
));

const categorizeDeletedCells = cellCoordinates => arrayContainsSomething(cellCoordinates)
	? R.reduce(
		(accumulator, { row, column, number }) => isSomething(number)
			? R.pipe(
				R.prop('floatingCells'),
				R.append({ number }),
				R.assoc('floatingCells', R.__, accumulator)
			)(accumulator)
			: R.pipe(
				R.prop('regularCells'),
				R.append({ row, column, }),
				R.assoc('regularCells', R.__, accumulator)
			)(accumulator),
		{ regularCells: [], floatingCells: [] },
		cellCoordinates
	)
	: { regularCells: [], floatingCells: [] };

const getDeletedCells = state => R.pipe(
	stateDeletedCells,
	categorizeDeletedCells,
)(state);

const categorizeCells = R.curry((state, cellCoordinates) => 
   arrayContainsSomething(cellCoordinates)
		? R.reduce(
			(accumulator, { row, column, number }) => isSomething(number) 
				? R.pipe(
					getFloatingCellFromStore,
					getSaveableFloatingCellData,
					R.append(R.__, accumulator.floatingCells),
					R.assoc('floatingCells', R.__, accumulator),
				)({ number, state })
				: R.pipe(
					getCellFromStore,
					getSaveableCellData,
					R.append(R.__, accumulator.regularCells),
					R.assoc('regularCells', R.__, accumulator),
				)({ row, column, state }),
			{ regularCells: [], floatingCells: [] },
			cellCoordinates
      )
   : { regularCells: [], floatingCells: [] }
);

const getAddedCells = state => R.pipe(
	stateAddedCells,
	categorizeCells(state)
)(state);

const getUpdatedCells = state => R.pipe(
	stateChangedCells,
	categorizeCells(state),
)(state);

const saveCellUpdates = async state => {
   const { regularCells: changedCells, floatingCells: changedFloatingCells } = getUpdatedCells(state);
	const { regularCells: addedCells, floatingCells: addedFloatingCells } = getAddedCells(state);
	const { regularCells: removedCells, floatingCells: removedFloatingCells } = getDeletedCells(state); 

	const allUpdatedFloatingCells = R.pipe(R.concat, removeDeletedCells(removedFloatingCells))(
      changedFloatingCells,
      addedFloatingCells
   );
	const allUpdatedCells = R.pipe(R.concat, removeDeletedCells(removedCells))(changedCells, addedCells);
   const sheetId = stateSheetId(state);
	try {
		if (arrayContainsSomething(allUpdatedFloatingCells) || arrayContainsSomething(allUpdatedCells)) {
			console.log('sheetServices--saveCellUpdates about to send updatedCellsAction');
			updatedCellsAction({ sheetId, cells: allUpdatedCells, floatingCells: allUpdatedFloatingCells });
		}
		if (arrayContainsSomething(removedFloatingCells) || arrayContainsSomething(removedCells)) {
			console.log('sheetServices--saveCellUpdates about to send deletedCellsAction');
			deletedCellsAction({ sheetId, cells: removedCells, floatingCells: removedFloatingCells });
		}
	} catch (err) {
		log({ level: LOG.ERROR }, 'error updating/adding cells in db');
		log({ level: LOG.DEBUG }, 'error updating/adding cells in db:', err);
		throw new Error('Error updating/adding cells in db', err);
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
			log({ level: LOG.ERROR }, 'error updating metadata in db');
			log({ level: LOG.DEBUG }, 'error updating metadata in db', err);
         throw new Error('Error updating metadata in db', err);
      }
   }
};

export const saveAllUpdates = async state => {
	console.log('sheetServices--saveAllUpdates started');
   await saveMetadataUpdates(state);
   await saveTitleUpdate(state);
	saveCellUpdates(state); // finished when we get actions for success/failure of cell updates and/or floating cell updates - 4 possible actions
   completedSaveUpdates(); // this just gets undoReducer to clear history. Want to put that into local storage instead...should really be waiting for all the above completed/failed actions
}

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
