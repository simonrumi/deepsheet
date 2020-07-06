import * as R from 'ramda';
import { isSomething } from './index';

/**
 * @param lens a lens for a sub-object e.g. R.lensProp('metadata')
 * @param propName the name of an property within the sub-object, e.g. 'totalRows'
 * @return a function taking 1 or 2 arguments
 * 1. the data (an object containing the named sub-object, e.g. data.metadata)
 * 2. a new value to update the object with (optional)
 * the returned function is called either like this
 * returnedFunction(objectContainingSubObject) // will get the value of the propName key
 * returnedFunction(objectContainingSubObject, newValue) // will set the newValue at the propName key
 **/
const subObjectGetterSetter = (lens, propName) => {
   const propLens = R.lensProp(propName); // a lens to focus on, e.g. 'totalRows'
   const fullPathLens = R.compose(lens, propLens); // a lens to focus on, e.g. state.totalRows
   return (data, newValue) =>
      isSomething(newValue) ? R.set(fullPathLens, newValue, data) : R.view(fullPathLens, data);
};

/*** get/set values from the db metadata structure ***/
const dbMetadataLens = R.lensProp('metadata');
console.log('TODO: dataStructureHelper only has getter for dbMetatdata currently, needs to set as well');
export const dbMetadata = R.view(dbMetadataLens);

// get/set values from the db structure
// dbTotalRows(dbObject) //returns value for totalRows
// dbTotalRows(dbObject, 12) // sets 12 as the value for totalRows (if this is possible)
export const dbTotalRows = subObjectGetterSetter(dbMetadataLens, 'totalRows');
export const dbTotalColumns = subObjectGetterSetter(dbMetadataLens, 'totalColumns');
export const dbParentSheetId = subObjectGetterSetter(dbMetadataLens, 'parentSheetId');
export const dbColumnVisibility = subObjectGetterSetter(dbMetadataLens, 'columnVisibility');
export const dbRowVisibility = subObjectGetterSetter(dbMetadataLens, 'rowVisibility');
export const dbColumnFilters = subObjectGetterSetter(dbMetadataLens, 'columnFilters');
export const dbRowFilters = subObjectGetterSetter(dbMetadataLens, 'rowFilters');

/*** get/set values from the db cell structure ***/
const dbCellsLens = R.lensProp('cells');
console.log('TODO: dataStructureHelper only has getter for dbCells currently, needs to set as well');
export const dbCells = R.view(dbCellsLens);

/***
 * get/set values from the state metadata structure
 * Note: the setters come with the subObjectGetterSetter, but while setting a value doesn't mutate the state,
 * (rather it makes a copy), still these setters will not be used for updating the state,
 * since we have the reducer system for that. The getters will be used, however
 ***/
const stateMetadataLens = R.lensProp('metadata');
export const stateMetadata = R.view(stateMetadataLens);

// get any top level property from the state's metadata
export const stateMetadataProp = R.curry((stateObj, propName) =>
   subObjectGetterSetter(stateMetadataLens, propName)(stateObj)
);

// get/set values from the state structure
// use (other functions below are similar):
// stateTotalRows(state) //returns value for totalRows
// stateTotalRows(state, 12) // sets 12 as the value for totalRows
export const stateTotalRows = subObjectGetterSetter(stateMetadataLens, 'totalRows');
export const stateTotalColumns = subObjectGetterSetter(stateMetadataLens, 'totalColumns');
export const stateParentSheetId = subObjectGetterSetter(stateMetadataLens, 'parentSheetId');
export const stateColumnVisibility = subObjectGetterSetter(stateMetadataLens, 'columnVisibility');
export const stateRowVisibility = subObjectGetterSetter(stateMetadataLens, 'rowVisibility');
export const stateColumnFilters = subObjectGetterSetter(stateMetadataLens, 'columnFilters');
export const stateRowFilters = subObjectGetterSetter(stateMetadataLens, 'rowFilters');
export const stateHasChanged = subObjectGetterSetter(stateMetadataLens, 'hasChanged');
export const stateRowMoved = subObjectGetterSetter(stateMetadataLens, 'rowMoved');
export const stateRowMovedTo = subObjectGetterSetter(stateMetadataLens, 'rowMovedTo');
export const stateColumnMoved = subObjectGetterSetter(stateMetadataLens, 'columnMoved');
export const stateColumnMovedTo = subObjectGetterSetter(stateMetadataLens, 'columnMovedTo');
export const stateRowSortByIndex = subObjectGetterSetter(stateMetadataLens, 'rowSortByIndex');
export const stateRowSortDirection = subObjectGetterSetter(stateMetadataLens, 'rowSortDirection');
export const stateColumnSortByIndex = subObjectGetterSetter(stateMetadataLens, 'columnSortByIndex');
export const stateColumnSortDirection = subObjectGetterSetter(stateMetadataLens, 'columnSortDirection');

/*** other, non-metadata state values ***/

// get/set values from the state cell structure
export const stateCell = (row, column, state, cellData) => {
   const cellName = 'cell_' + row + '_' + column;
   const stateCellLens = R.lensProp(cellName);
   return isSomething(cellData) ? R.set(stateCellLens, cellData, state) : R.view(stateCellLens, state);
};

// get the sheet's id. Will never set this, only retrieve it, as it is mongodb that generates this.
const stateSheetIdLens = R.lensProp('sheetId');
export const stateSheetId = R.view(stateSheetIdLens); // use: stateSheetId(stateObj);

const stateTitleLens = R.lensProp('title');
export const stateTitleIsCallingDb = subObjectGetterSetter(stateTitleLens, 'isCallingDb');
export const stateTitleIsEditingTitle = subObjectGetterSetter(stateTitleLens, 'isEditingTitle');
export const stateTitleIsStale = subObjectGetterSetter(stateTitleLens, 'isStale');
export const stateTitleLastUpdated = subObjectGetterSetter(stateTitleLens, 'lastUpdated');
export const stateTitleNeedsUpdate = subObjectGetterSetter(stateTitleLens, 'needsUpdate');
export const stateTitleText = subObjectGetterSetter(stateTitleLens, 'text');

const stateCellDbUpdatesLens = R.lensProp('cellDbUpdates');
export const stateCellDbUpdatesIsCallingDb = subObjectGetterSetter(stateCellDbUpdatesLens, 'isCallingDb');
export const stateCellDbUpdatesErrorMessage = subObjectGetterSetter(stateCellDbUpdatesLens, 'errorMessage');
export const stateCellDbUpdatesIsStale = subObjectGetterSetter(stateCellDbUpdatesLens, 'isStale');
export const stateCellDbUpdatesLastUpdated = subObjectGetterSetter(stateCellDbUpdatesLens, 'lastUpdated');
export const stateChangedCells = subObjectGetterSetter(stateCellDbUpdatesLens, 'changedCells');

// return true if any of the objects with sub-values of "isCallingDb" are true
export const stateIsCallingDb = state => stateTitleIsCallingDb(state) || stateCellDbUpdatesIsCallingDb(state);

// return true if any of the objects with sub-values of "isStale" are true
export const stateIsStale = state => stateTitleIsStale(state) || stateCellDbUpdatesIsStale(state);
