import * as R from 'ramda';
import { isSomething, isNothing } from './index';

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
export const dbMetadata = R.view(dbMetadataLens);

// get/set values from the db structure, usage:
// dbTotalRows(dbObject) //returns value for totalRows
// dbTotalRows(dbObject, 12) // sets 12 as the value for totalRows (if this is possible)
export const dbTotalRows = subObjectGetterSetter(dbMetadataLens, 'totalRows');
export const dbTotalColumns = subObjectGetterSetter(dbMetadataLens, 'totalColumns');
export const dbParentSheetId = subObjectGetterSetter(dbMetadataLens, 'parentSheetId');
export const dbColumnVisibility = subObjectGetterSetter(dbMetadataLens, 'columnVisibility');
export const dbRowVisibility = subObjectGetterSetter(dbMetadataLens, 'rowVisibility');
export const dbColumnFilters = subObjectGetterSetter(dbMetadataLens, 'columnFilters');
export const dbRowFilters = subObjectGetterSetter(dbMetadataLens, 'rowFilters');

// get the sheet's id from db structur
const dbSheetIdLens = R.lensProp('id');
export const dbSheetId = R.view(dbSheetIdLens);

/*** get/set values from the db cell structure ***/
const dbCellsLens = R.lensProp('cells');
export const dbCells = R.view(dbCellsLens);

/***
 * get/set values from the state metadata structure
 * Note: the setters come with the subObjectGetterSetter, but while setting a value doesn't mutate the state,
 * (rather it makes a copy), still these setters will not be used for updating the state,
 * since we have the reducer system for that. The getters will be used, however
 ***/
const stateMetadataLens = R.lensProp('metadata');
export const stateMetadata = R.view(stateMetadataLens);
export const saveableStateMetadata = R.pipe(
   stateMetadata,
   R.pick([
      'totalRows',
      'totalColumns',
      'parentSheetId',
      'summaryCell',
      'columnVisibility',
      'rowVisibility',
      'columnFilters',
      'rowFilters',
   ])
);

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
export const stateRowMoved = subObjectGetterSetter(stateMetadataLens, 'rowMoved');
export const stateRowMovedTo = subObjectGetterSetter(stateMetadataLens, 'rowMovedTo');
export const stateColumnMoved = subObjectGetterSetter(stateMetadataLens, 'columnMoved');
export const stateColumnMovedTo = subObjectGetterSetter(stateMetadataLens, 'columnMovedTo');
export const stateRowSortByIndex = subObjectGetterSetter(stateMetadataLens, 'rowSortByIndex');
export const stateRowSortDirection = subObjectGetterSetter(stateMetadataLens, 'rowSortDirection');
export const stateColumnSortByIndex = subObjectGetterSetter(stateMetadataLens, 'columnSortByIndex');
export const stateColumnSortDirection = subObjectGetterSetter(stateMetadataLens, 'columnSortDirection');
export const stateMetadataIsStale = subObjectGetterSetter(stateMetadataLens, 'isStale');
export const stateMetadataIsCallingDb = subObjectGetterSetter(stateMetadataLens, 'isCallingDb');
export const stateMetadataErrorMessage = subObjectGetterSetter(stateMetadataLens, 'errorMessage');
export const stateMetadataLastUpdated = subObjectGetterSetter(stateMetadataLens, 'lastUpdated');

/**** get/set values from the state's cell structure ****/
const getStateCellLens = (row, column) => {
   const cellName = 'cell_' + row + '_' + column;
   return R.lensProp(cellName);
};
export const stateCell = (row, column, state, cellData) => {
   const stateCellLens = getStateCellLens(row, column);
   return isSomething(cellData) ? R.set(stateCellLens, cellData, state) : R.view(stateCellLens, state);
};

export const stateCellIsHighlighted = (row, column, state, isHighlightedNew) => {
   const isHighlightedLens = R.lensPath(['cell_' + row + '_' + column, 'isHighlighted']);
   // note using R.isNil because only want to test if it is null or undefined
   return R.isNil(isHighlightedNew)
      ? R.view(isHighlightedLens, state)
      : R.set(isHighlightedLens, isHighlightedNew, state);
};

export const getStateCellSubsheetId = R.curry((cell, state) => {
   if (isNothing(cell)) {
      return null;
   }
   const cellName = 'cell_' + cell.row + '_' + cell.column;
   const subsheetIdLens = R.lensPath([cellName, 'content', 'subsheetId']);
   return R.view(subsheetIdLens, state);
});

export const getStateCellText = (cell, state) => {
   if (isNothing(cell)) {
      return null;
   }
   const cellName = 'cell_' + cell.row + '_' + cell.column;
   const textLens = R.lensPath([cellName, 'content', 'text']);
   return R.view(textLens, state);
};

/*** get and values for the cell itself - note that getters and setters are separate fns so that the setter can be curried ***/
const cellRowLens = R.lensProp('row');
export const cellRow = cell => R.view(cellRowLens, cell);
export const cellRowSetter = R.curry((newRow, cell) => R.set(cellRowLens, newRow, cell));

const cellColumnLens = R.lensProp('column');
export const cellColumn = cell => R.view(cellColumnLens, cell);
export const cellColumnSetter = R.curry((newColumn, cell) => R.set(cellColumnLens, newColumn, cell));

const cellTextLens = R.lensPath(['content', 'text']);
export const cellText = cell => R.view(cellTextLens, cell);
export const cellTextSetter = R.curry((newText, cell) => R.set(cellTextLens, newText, cell));

const cellSubsheetIdLens = R.lensPath(['content', 'subsheetId']);
export const cellSubsheetId = cell => R.view(cellSubsheetIdLens, cell);
export const cellSubsheetIdSetter = R.curry((newSubsheetId, cell) => R.set(cellSubsheetIdLens, newSubsheetId, cell));

const cellVisibleLens = R.lensProp('visible');
export const cellVisible = cell => R.view(cellVisibleLens, cell);
export const cellVisibleSetter = R.curry((newVisibility, cell) => R.set(cellVisibleLens, newVisibility, cell));

/*** other state values ***/
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

const stateMenuLens = R.lensProp('menu');
export const stateShowMenu = subObjectGetterSetter(stateMenuLens, 'showMenu');

const editorLens = R.lensProp('editor');
export const stateEditorRow = subObjectGetterSetter(editorLens, 'row');
export const stateEditorColumn = subObjectGetterSetter(editorLens, 'column');

/**
 * stuff to do with wether any parts of the state is stale
 */
// return true if any of the state objects with sub-values of "isCallingDb" are true
export const stateIsCallingDb = state =>
   stateTitleIsCallingDb(state) || stateCellDbUpdatesIsCallingDb(state) || stateMetadataIsCallingDb(state);

// return true if any of the state objects with sub-values of "isStale" are true
export const stateIsStale = state =>
   stateTitleIsStale(state) || stateCellDbUpdatesIsStale(state) || stateMetadataIsStale(state);

// return true if we have an issue with any state objects that tried to save to the db but got error messages
export const stateErrorMessages = state =>
   stateCellDbUpdatesErrorMessage(state) || stateTitleNeedsUpdate(state) || stateMetadataErrorMessage(state);
