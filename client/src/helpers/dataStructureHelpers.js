import * as R from 'ramda';
import { isSomething } from './index';

/************************************************ GENERAL STUFF **********************************************/

const createGetterSetter = lens => (data, newValue) =>
   isSomething(newValue) ? R.set(lens, newValue, data) : R.view(lens, data);

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
   return createGetterSetter(fullPathLens);
};

const createGetter = lens => data => R.view(lens, data);
const subObjectGetter = R.curry((lens, propName) => {
   const propLens = R.lensProp(propName); // e.g. propName = 'totalRows'
   const fullPathLens = R.compose(lens, propLens); // gets us to e.g. metadata.totalRows
   return createGetter(fullPathLens);
});

// the "present" object wraps all the stuff in the state
const presentLens = R.lensProp('present');
export const statePresent = R.view(presentLens);
const pastLens = R.lensProp('past');
export const statePast = R.view(pastLens);
const futureLens = R.lensProp('future');
export const stateFuture = R.view(futureLens);
const originalValueLens = R.lensPath(['original', 'value']);
export const stateOriginalValue = R.view(originalValueLens);
const originalRowLens = R.lensPath(['original', 'row']);
export const stateOriginalRow = R.view(originalRowLens);
const originalColumnLens = R.lensPath(['original', 'column']);
export const stateOriginalColumn = R.view(originalColumnLens);


/************************************************ DB **********************************************/

/*** get/set values from the db metadata structure ***/
const dbMetadataLens = R.lensProp('metadata');
export const dbMetadata = R.view(dbMetadataLens);

// get/set values from the db structure, usage:
// dbTotalRows(dbObject) //returns value for totalRows
// dbTotalRows(dbObject, 12) // sets 12 as the value for totalRows (if this is possible)
export const dbTotalRows = subObjectGetterSetter(dbMetadataLens, 'totalRows');
export const dbTotalColumns = subObjectGetterSetter(dbMetadataLens, 'totalColumns');
export const dbParentSheetId = subObjectGetterSetter(dbMetadataLens, 'parentSheetId');
export const dbColumnFilters = subObjectGetterSetter(dbMetadataLens, 'columnFilters');
export const dbRowFilters = subObjectGetterSetter(dbMetadataLens, 'rowFilters');
export const dbRowHeights = subObjectGetterSetter(dbMetadataLens, 'rowHeights');
export const dbColumnWidths = subObjectGetterSetter(dbMetadataLens, 'columnWidths');
export const dbLastUpdated = subObjectGetterSetter(dbMetadataLens, 'lastUpdated');

// get the sheet's id from db structure
const dbSheetIdLens = R.lensProp('id');
export const dbSheetId = R.view(dbSheetIdLens);

/*** get/set values from the db cell structure ***/
const dbCellsLens = R.lensProp('cells');
export const dbCells = R.view(dbCellsLens);

/*** get/set values from the db filter structure ***/
const filterFilterExpressionLens = R.lensProp('filterExpression');
export const filterFilterExpression = createGetterSetter(filterFilterExpressionLens);

const filterCaseSensitiveLens = R.lensProp('caseSensitive');
export const filterCaseSensitive = createGetterSetter(filterCaseSensitiveLens);

const filterRegexLens = R.lensProp('regex');
export const filterRegex = createGetterSetter(filterRegexLens);

const filterIndexLens = R.lensProp('index');
export const filterIndex = createGetterSetter(filterIndexLens);

/************************************************ STATE METADATA **********************************************/

/***
 * get/set values from the state metadata structure
 * Note: the setters come with the subObjectGetterSetter, but while setting a value doesn't mutate the state,
 * (rather it makes a copy), still these setters will not be used for updating the state,
 * since we have the reducer system for that. The getters will be used, however
 ***/
const metadataLens = R.lensProp('metadata');
const stateMetadataLens = R.compose(presentLens, metadataLens);
export const stateMetadata = R.view(stateMetadataLens);
export const saveableStateMetadata = R.pipe(
   stateMetadata,
   R.pick([
      'totalRows', 
      'totalColumns', 
      'parentSheetId',
      'columnFilters', 
      'rowFilters',
      'frozenColumns',
      'frozenRows',
      'columnWidths',
      'rowHeights',
   ])
);    

// get any top level property from the state's metadata
export const stateMetadataProp = R.curry((stateObj, propName) => {
   const propLens = R.lensProp(propName);
   const propInMetadataLens = R.compose(stateMetadataLens, propLens);
   return R.view(propInMetadataLens, stateObj);
});

// get values from the state structure
// use (other functions below are similar):
// stateTotalRows(state) //returns value for totalRows
export const stateTotalRows = subObjectGetter(stateMetadataLens, 'totalRows');
export const stateTotalColumns = subObjectGetter(stateMetadataLens, 'totalColumns');
export const stateParentSheetId = subObjectGetter(stateMetadataLens, 'parentSheetId');
export const stateColumnVisibility = subObjectGetter(stateMetadataLens, 'columnVisibility');
export const stateRowVisibility = subObjectGetter(stateMetadataLens, 'rowVisibility');
export const stateColumnFilters = subObjectGetter(stateMetadataLens, 'columnFilters');
export const stateRowFilters = subObjectGetter(stateMetadataLens, 'rowFilters');
export const stateRowMoved = subObjectGetter(stateMetadataLens, 'rowMoved');
export const stateRowMovedTo = subObjectGetter(stateMetadataLens, 'rowMovedTo');
export const stateColumnMoved = subObjectGetter(stateMetadataLens, 'columnMoved');
export const stateColumnMovedTo = subObjectGetter(stateMetadataLens, 'columnMovedTo');
export const stateRowSortByIndex = subObjectGetter(stateMetadataLens, 'rowSortByIndex');
export const stateRowSortDirection = subObjectGetter(stateMetadataLens, 'rowSortDirection');
export const stateColumnSortByIndex = subObjectGetter(stateMetadataLens, 'columnSortByIndex');
export const stateColumnSortDirection = subObjectGetter(stateMetadataLens, 'columnSortDirection');
export const stateSortType = subObjectGetter(stateMetadataLens, 'sortType');
export const stateMetadataIsStale = subObjectGetter(stateMetadataLens, 'isStale');
export const stateMetadataIsCallingDb = subObjectGetter(stateMetadataLens, 'isCallingDb');
export const stateMetadataErrorMessage = subObjectGetter(stateMetadataLens, 'errorMessage');
export const stateLastUpdated = subObjectGetter(stateMetadataLens, 'lastUpdated'); // don't have "Metadata" in the name, because this is the last updated date for the whole sheet, not just the metadata
export const stateFrozenRows = subObjectGetter(stateMetadataLens, 'frozenRows');
export const stateFrozenColumns = subObjectGetter(stateMetadataLens, 'frozenColumns');
export const stateRowHeights = subObjectGetter(stateMetadataLens, 'rowHeights');
export const stateColumnWidths = subObjectGetter(stateMetadataLens, 'columnWidths');

/***** these are to get the previous version of various metadata items *****/
export const statePastColumnVisibility = R.pipe(
   R.prop('past'),
   R.last,
   R.path(['metadata', 'columnVisibility'])
);
export const statePastRowVisibility = R.pipe(
   R.prop('past'),
   R.last,
   R.path(['metadata', 'rowVisibility'])
);

/* the axisItemTool is the popup that can show for each column and each row.
The following metadata says which one is visible and which column/row it is for
metadata {
   ...
   axisItemTool: {
      isVisible: true,
      axis: "row",
      index: 2
   }
} */
const stateAxisItemToolIndexLens = R.compose(stateMetadataLens, R.lensPath(['axisItemTool', 'index']));
export const stateAxisItemToolIndex = R.view(stateAxisItemToolIndexLens);
const stateAxisItemToolAxisLens = R.compose(stateMetadataLens, R.lensPath(['axisItemTool', 'axis']));
export const stateAxisItemToolAxis = R.view(stateAxisItemToolAxisLens);
const stateAxisItemToolIsVisibileLens = R.compose(stateMetadataLens, R.lensPath(['axisItemTool', 'isVisible']));
export const stateAxisItemToolIsVisible = R.view(stateAxisItemToolIsVisibileLens);

/** 
 * Sheet Metadata - if we directly have the sheet (not inside a "present" object) use these:
*/
export const sheetParentSheetId = subObjectGetter(metadataLens, 'parentSheetId'); 

/************************************************ STATE FILTER MODAL **********************************************/
const filterModalLens = R.lensProp('filterModal');
const stateFilterModalLens = R.compose(presentLens, filterModalLens);
export const stateShowFilterModal = subObjectGetter(stateFilterModalLens, 'showFilterModal');
export const stateFilterColumnIndex = subObjectGetter(stateFilterModalLens, 'columnIndex');
export const stateFilterRowIndex = subObjectGetter(stateFilterModalLens, 'rowIndex');
export const stateFilterExpression = subObjectGetter(stateFilterModalLens, 'filterExpression');
export const stateFilterHideBlanks = subObjectGetter(stateFilterModalLens, 'hideBlanks');
export const stateFilterCaseSensitive = subObjectGetter(stateFilterModalLens, 'caseSensitive');
export const stateFilterRegex = subObjectGetter(stateFilterModalLens, 'regex');
export const stateFilterIsStale = subObjectGetter(stateFilterModalLens, 'isStale');

/************************************************ STATE SORT MODAL **********************************************/
const sortModalLens = R.lensProp('sortModal');
const stateSortModalLens = R.compose(presentLens, sortModalLens);
export const stateShowSortModal = subObjectGetter(stateSortModalLens, 'showSortModal');
export const stateSortColumnIndex = subObjectGetter(stateSortModalLens, 'columnIndex');
export const stateSortRowIndex = subObjectGetter(stateSortModalLens, 'rowIndex');

/************************************************ STATE AUTH **********************************************/
const authLens = R.lensProp('auth');
const stateAuthLens = R.compose(presentLens, authLens);
export const stateIsLoggedIn = subObjectGetter(stateAuthLens, 'isLoggedIn');
export const stateShowLoginModal = subObjectGetter(stateAuthLens, 'showLoginModal');
export const stateAuthError = subObjectGetter(stateAuthLens, 'error');

/************************************************ STATE CELLS **********************************************/
const cellKeysLens = R.lensProp('cellKeys');
const stateCellKeysLens = R.compose(presentLens, cellKeysLens);
export const stateCellKeys = R.view(stateCellKeysLens);

export const stateCell = R.curry((state, cellKey) =>
   R.view(
      R.compose(
         presentLens,
         R.lensProp(cellKey)
      ),
      state
   )
);

/*** 
 * get values for the cell itself - note that getters and setters are separate fns so that the setter can be curried. 
 * The setters are going to be used on copies of the cell that will be updated in the state via actions
***/
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

const cellInCellRangeLens = R.lensProp('inCellRange');
export const cellInCellRange = cell => R.view(cellInCellRangeLens, cell);
export const cellInCellRangeSetter = R.curry((newValue, cell) => R.set(cellInCellRangeLens, newValue, cell));

const cellIsCallingDbLens = R.lensProp('isCallingDb');
export const cellIsCallingDb = cell => R.view(cellIsCallingDbLens, cell);
export const cellIsCallingDbSetter = R.curry((value, cell) => R.set(cellIsCallingDbLens, value, cell));

const cellIsStaleLens = R.lensProp('isStale');
export const cellIsStale = cell => R.view(cellIsStaleLens, cell);
export const cellIsStaleSetter = R.curry((value, cell) => R.set(cellIsStaleLens, value, cell));

const cellDbUpdatesLens = R.lensProp('cellDbUpdates');
const stateCellDbUpdatesLens = R.compose(presentLens, cellDbUpdatesLens);
export const stateCellDbUpdatesIsCallingDb = subObjectGetter(stateCellDbUpdatesLens, 'isCallingDb');
export const stateCellDbUpdatesErrorMessage = subObjectGetter(stateCellDbUpdatesLens, 'errorMessage');
export const stateCellDbUpdatesIsStale = subObjectGetter(stateCellDbUpdatesLens, 'isStale');
export const stateCellDbUpdatesLastUpdated = subObjectGetter(stateCellDbUpdatesLens, 'lastUpdated');
export const stateChangedCells = subObjectGetter(stateCellDbUpdatesLens, 'changedCells');

/************************************************ STATE SHEET **********************************************/

const sheetLens = R.lensProp('sheet');
const stateSheetLens = R.compose(presentLens, sheetLens);

const sheetIdLens = R.lensProp('sheetId');
const stateSheetIdLens = R.compose(stateSheetLens, sheetIdLens);
export const stateSheetId = R.view(stateSheetIdLens);

const isCallingDbLens = R.lensProp('isCallingDb');
const stateSheetIsCallingDbLens = R.compose(stateSheetLens, isCallingDbLens);
export const stateSheetIsCallingDb = R.view(stateSheetIsCallingDbLens);

const errorMessageLens = R.lensProp('errorMessage');
const stateSheetErrorMessageLens = R.compose(stateSheetLens, errorMessageLens);
export const stateSheetErrorMessage = R.view(stateSheetErrorMessageLens);

const cellsLoadedLens = R.lensProp('cellsLoaded');
const stateSheetCellsLoadedLens = R.compose(stateSheetLens, cellsLoadedLens);
export const stateSheetCellsLoaded = R.view(stateSheetCellsLoadedLens);

const cellsUpdateInfoLens = R.lensProp('cellsUpdateInfo');
const stateSheetCellsUpdateInfoLens = R.compose(stateSheetLens, cellsUpdateInfoLens);
export const stateCellsUpdateInfo = R.view(stateSheetCellsUpdateInfoLens);

const cellsUpdateDataLens = R.lensProp('data');
const stateSheetCellsUpdateDataLens = R.compose(stateSheetLens, cellsUpdateInfoLens, cellsUpdateDataLens);
export const stateCellsUpdateData = R.view(stateSheetCellsUpdateDataLens);

const cellsChangeTypeLens = R.lensProp('changeType');
const stateSheetCellsChangeTypeLens = R.compose(stateSheetLens, cellsUpdateInfoLens, cellsChangeTypeLens);
export const stateCellsChangeType = R.view(stateSheetCellsChangeTypeLens);

const cellsRenderCountLens = R.lensProp('cellsRenderCount');
const stateSheetCellsRenderCountLens = R.compose(stateSheetLens, cellsRenderCountLens);
export const stateCellsRenderCount = R.view(stateSheetCellsRenderCountLens);

/************************************************ STATE FOCUS **********************************************/
const focusLens = R.lensProp('focus'); // used to track which UI element currently has focus
const stateFocusLens = R.compose(presentLens, focusLens);
export const stateFocus = R.view(stateFocusLens);
const stateFocusCellLens = R.compose(stateFocusLens, R.lensProp('cell'));
export const stateFocusCell = R.view(stateFocusCellLens);
const stateFocusCellRefLens = R.compose(stateFocusLens, R.lensProp('ref'));
export const stateFocusCellRef = R.view(stateFocusCellRefLens);
const stateFocusAbortControlLens = R.compose(stateFocusLens, R.lensProp('abortControl'));
export const stateFocusAbortControl = R.view(stateFocusAbortControlLens);

/************************************************ STATE CELL RANGE **********************************************/
const cellRangeLens = R.lensProp('cellRange');
const stateCellRangeLens = R.compose(presentLens, cellRangeLens);
export const stateCellRange = R.view(stateCellRangeLens);
const stateCellRangeMaybeFromLens = R.compose(stateCellRangeLens, R.lensProp('maybeFrom'));
export const stateCellRangeMaybeFrom = R.view(stateCellRangeMaybeFromLens);
const stateCellRangeFromLens = R.compose(stateCellRangeLens, R.lensProp('from'));
export const stateCellRangeFrom = R.view(stateCellRangeFromLens);
const stateCellRangeToLens = R.compose(stateCellRangeLens, R.lensProp('to'));
export const stateCellRangeTo = R.view(stateCellRangeToLens);
const stateCellRangeCellsLens = R.compose(stateCellRangeLens, R.lensProp('cells'));
export const stateCellRangeCells = R.view(stateCellRangeCellsLens);
const stateRangeWasCopiedLens = R.compose(stateCellRangeLens, R.lensProp('rangeWasCopied'));
export const stateRangeWasCopied = R.view(stateRangeWasCopiedLens);

/************************************************ STATE CLIPBOARD **********************************************/
const clipboardLens = R.lensProp('clipboard');
const stateClipboardLens = R.compose(presentLens, clipboardLens);
export const stateClipboard = R.view(stateClipboardLens);
const stateClipboardTextLens = R.compose(stateClipboardLens, R.lensProp('text'));
export const stateClipboardText = R.view(stateClipboardTextLens);

/************************************************ STATE PASTE OPTIONS MODAL **********************************************/
const pasteOptionsModalLens = R.lensProp('pasteOptionsModal');
const statePasteOptionsModalLens = R.compose(presentLens, pasteOptionsModalLens);
const stateSystemClipboardLens = R.compose(statePasteOptionsModalLens, R.lensProp('systemClipboard'));
export const stateSystemClipboard = R.view(stateSystemClipboardLens);
const stateShowPasteOptionsModalLens = R.compose(statePasteOptionsModalLens, R.lensProp('showModal'));
export const stateShowPasteOptionsModal = R.view(stateShowPasteOptionsModalLens);
const statePasteOptionsModalPositioningLens = R.compose(statePasteOptionsModalLens, R.lensProp('positioning'));
export const statePasteOptionsModalPositioning = R.view(statePasteOptionsModalPositioningLens);
const stateBlurEditorFunctionLens = R.compose(statePasteOptionsModalLens, R.lensProp('blurEditorFunction'));
export const stateBlurEditorFunction = R.view(stateBlurEditorFunctionLens);

/************************************************ STATE GLOBAL INFO MODAL **********************************************/
const globalInfoModalLens = R.lensProp('globalInfoModal');
const stateGlobalInfoModalLens = R.compose(presentLens, globalInfoModalLens);
const stateGlobalInfoModalIsVisibleLens = R.compose(stateGlobalInfoModalLens, R.lensProp('isVisible'));
export const stateGlobalInfoModalIsVisible = R.view(stateGlobalInfoModalIsVisibleLens);
const stateGlobalInfoModalContentLens = R.compose(stateGlobalInfoModalLens, R.lensProp('content'));
export const stateGlobalInfoModalContent = R.view(stateGlobalInfoModalContentLens);
const stateGlobalInfoModalCloseFnLens = R.compose(stateGlobalInfoModalLens, R.lensProp('closeFn'));
export const stateGlobalInfoModalCloseFn = R.view(stateGlobalInfoModalCloseFnLens);

/************************************************ STATE OTHER **********************************************/
const titleLens = R.lensProp('title');
const stateTitleLens = R.compose(presentLens, titleLens);
export const stateTitleIsCallingDb = subObjectGetter(stateTitleLens, 'isCallingDb');
export const stateTitleIsEditingTitle = subObjectGetter(stateTitleLens, 'isEditingTitle');
export const stateTitleIsStale = subObjectGetter(stateTitleLens, 'isStale');
export const stateTitleErrorMessage = subObjectGetter(stateTitleLens, 'errorMessage');
export const stateTitleLastUpdated = subObjectGetter(stateTitleLens, 'lastUpdated');
export const stateTitleText = subObjectGetter(stateTitleLens, 'text');

const menuLens = R.lensProp('menu');
const stateMenuLens = R.compose(presentLens, menuLens);
export const stateShowMenu = subObjectGetter(stateMenuLens, 'showMenu');

const editorLens = R.lensProp('editor');
const stateEditorLens = R.compose(presentLens, editorLens);
export const stateEditor = R.view(stateEditorLens);
export const stateEditorRow = subObjectGetter(stateEditorLens, 'row');
export const stateEditorColumn = subObjectGetter(stateEditorLens, 'column');
export const stateEditorContent = subObjectGetter(stateEditorLens, 'content');

const sheetsLens = R.lensProp('sheets');
const stateSheetsLens = R.compose(presentLens, sheetsLens);
export const stateSheetsIsCallingDb = subObjectGetter(stateSheetsLens, 'isCallingDb');
export const stateSheetsErrorMessage = subObjectGetter(stateSheetsLens, 'errorMessage');
export const stateSheets = subObjectGetter(stateSheetsLens, 'sheets');
export const stateSheetsTree = subObjectGetter(stateSheetsLens, 'sheetsTree');
export const stateSheetsTreeStale = subObjectGetter(stateSheetsLens, 'sheetsTreeStale');

const dragMonitorLens = R.lensProp('dragMonitor');
const stateDragMonitorLens = R.compose(presentLens, dragMonitorLens);
export const stateIsDragging = subObjectGetter(stateDragMonitorLens, 'isDragging');
export const stateDragType = subObjectGetter(stateDragMonitorLens, 'dragType');
export const stateDragData = subObjectGetter(stateDragMonitorLens, 'dragData');

/************************************************ STATE IS_STALE  **********************************************/

// return true if any of the state objects with sub-values of "isCallingDb" are true
export const stateIsCallingDb = state =>
   stateTitleIsCallingDb(state) || stateCellDbUpdatesIsCallingDb(state) || stateMetadataIsCallingDb(state);

// return true if any of the state objects with sub-values of "isStale" are true
export const stateIsStale = state =>
   stateTitleIsStale(state) || stateCellDbUpdatesIsStale(state) || stateMetadataIsStale(state);

// return true if we have an issue with any state objects that tried to save to the db but got error messages
export const stateErrorMessages = state =>
   stateCellDbUpdatesErrorMessage(state) 
      // || (stateTitleIsStale(state) && !stateTitleIsCallingDb(state) && !stateTitleIsEditingTitle(state))
      || stateMetadataErrorMessage(state);
