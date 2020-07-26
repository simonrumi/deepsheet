import * as R from 'ramda';
import managedStore from '../store';
import { updatedSheetId } from '../actions/fetchSheetActions';
import { updatedCells } from '../actions/cellActions';
import { updatedMetadata } from '../actions/metadataActions';
import sheetQuery from '../queries/sheetQuery';
import titleMutation from '../queries/titleMutation';
import { isSomething, arrayContainsSomething } from '../helpers';
import {
   stateChangedCells,
   stateCell,
   stateSheetId,
   stateMetadataIsStale,
   saveableStateMetadata,
} from '../helpers/dataStructureHelpers';

export const fetchSheet = async sheetId => {
   const sheet = sheetQuery(sheetId)
      .then(res => res.data.sheet)
      .catch(err => console.error('error in sheetServices.fetchSheet', err));
   return sheet;
};

export const updateTitleInDB = async (id, title) => {
   return await titleMutation(id, title);
};

const getUpdatedCells = R.curry((state, updatedCellCoordinates) => {
   if (isSomething(updatedCellCoordinates) && arrayContainsSomething(updatedCellCoordinates)) {
      return R.map(({ row, column }) => {
         const cellData = stateCell(row, column, state);
         return R.omit(['isStale', 'isHighlighted'], cellData); // these properties are just for the redux state, not for the db to save
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
         await updatedCells({ sheetId, updatedCells: changedCells });
      } catch (err) {
         console.error('Error updating cells in db', err);
         throw new Error('Error updating cells in db', err);
      }
   }
};

const getChangedMetadata = state => (stateMetadataIsStale(state) ? saveableStateMetadata(state) : null);

export const saveMetadataUpdates = async state => {
   console.log('TODO sheetServices.saveMetadataUpdates is saving all the metadata not just the changed parts');
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
   // save any changes to the current sheet
   saveAllUpdates(state);
   // clear out the cell reducers from any previosly loaded sheet
   const newCombinedReducers = managedStore.store.reducerManager.removeMany(managedStore.state.cellKeys);
   managedStore.store.replaceReducer(newCombinedReducers);
   // then get the new sheet
   updatedSheetId(sheetId);
});

/****
 * not using memoization at this poiint, but keepin here in case it comes up again

Need to have these impure functions for dealing with memoizedItems.
Can't put memoizedItems into the Redux store because then there's a circular dependancy
where this file imports an update action, and actions imports fetchSummaryCellFromSheet

// TODO might be able to put memoizedItems into the store, now that fetchSummaryCellFromSheet is not being used. See comment in sheetServices.js
const memoizedItems = {};

const updatedMemoizedItems = R.curry((groupName, item) => {
   memoizedItems[groupName] = { ...memoizedItems[groupName], ...item };
   return item; // passing this through
});

export const clearMemoizedItems = () =>
   R.pipe(
      R.keys,
      R.map(key => (memoizedItems[key] = {}))
   )(memoizedItems);


// these args (arg1, ...args) are the args for the fn.
// the first one is split out of the args array so that R.curry is forced to return a function,
// if there is not at least 1 argument supplied to maybeMemoize, (after the 1st argument which is the fn).

// make memoized items with functions like this
// export const fetchSummaryCellFromSheet = maybeMemoize(async sheetId => {
// ...then call that function like this
// fetchSummaryCellFromSheet(sheetId) 
const maybeMemoize = R.curry((fn, groupName, arg1, ...args) => {
   const key = R.reduce((accumulator, value) => R.concat(accumulator, JSON.stringify(value)), '', [arg1, ...args]);

   if (R.hasPath([groupName, key], memoizedItems)) {
      return R.ifElse(
         () => memoizedItems[groupName][key].forceUpdate,
         fn, //fn is fed the args
         () => R.path([groupName, key, 'value'], memoizedItems)
      )(arg1, ...args);
   }

   return R.pipe(
      fn, // get the result from calling the fn with the args
      R.assoc('value', R.__, { forceUpdate: false }), //create an obj with value: result
      R.assoc(key, R.__, {}), // create a parent obj with key: obj
      updatedMemoizedItems(groupName), // put parent obj into memoizedItems and return the item
      R.path([key, 'value']) // return the result (of calling fn with the args)
   )(arg1, ...args);
});
/*** end memoization functions ***/
