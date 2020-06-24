import * as R from 'ramda';
import { isSomething } from './index';
import { rowMoved, rowMovedTo, columnMoved, columnMovedTo } from '../actions';

// idea is to abstract away the structure of the Sheet so database can serve it up however it likes
// and we just make changes here

//should do the same thing for the structure of the Store

/***
 * functions for getting values from the metadata section of the data structure
 ***/

/**
 * @param metadataLens a lens for a metadata sub-object e.g. R.lensProp('metadata')
 * @param metadataPropName the name of an property within the metadata sub-object
 * @return a function taking 1 or 2 arguments
 * 1. the data (an object containing a metadata sub-object)
 * 2. a new value to update the object with (optional)
 * the returned function is called either like this
 * returnedFunction(objectContainingMetadataObject) // will get the value of the metadataPropName key
 * returnedFunction(objectContainingMetadataObject, newValue) // will set the newValue at the metadataPropName key
 **/

const metadataGetterSetter = (metadataLens, metadataPropName) => {
   const metadataPropLens = R.lensProp(metadataPropName); // a lens to focus on, e.g. 'totalRows'
   const fullPathLens = R.compose(metadataLens, metadataPropLens); // a lens to focus on, e.g. state.totalRows
   return (data, newValue) =>
      isSomething(newValue) ? R.set(fullPathLens, newValue, data) : R.view(fullPathLens, data);
};

/*** get/set values from the db metadata structure ***/
const dbMetadataLens = R.lensProp('metadata');

// get/set totalRows from the db structure
export const dbTotalRows = metadataGetterSetter(dbMetadataLens, 'totalRows');

// get/set totalColumns from the db structure
export const dbTotalColumns = metadataGetterSetter(dbMetadataLens, 'totalColumns');

// get/set parentSheetId from the db structure
export const dbParentSheetId = metadataGetterSetter(dbMetadataLens, 'parentSheetId');

// get/set columnVisibility from the db structure
export const dbColumnVisibility = metadataGetterSetter(dbMetadataLens, 'columnVisibility');

// get/set rowVisibility from the db structure
export const dbRowVisibility = metadataGetterSetter(dbMetadataLens, 'rowVisibility');

// get/set columnFilters from the db structure
export const dbColumnFilters = metadataGetterSetter(dbMetadataLens, 'columnFilters');

// get/set rowFilters from the db structure
export const dbRowFilters = metadataGetterSetter(dbMetadataLens, 'rowFilters');

/***
 * get/set values from the state metadata structure
 * Note: the setters come with the metadataGetterSetter, but while setting a value doesn't mutate the state,
 * (rather it makes a copy), still these setters will not be used for updating the state,
 * since we have the reducer system for that. The getters will be used, however
 ***/
const stateMetadataLens = R.lensProp('sheet');
export const stateMetadata = R.view(stateMetadataLens);

// get any top level property from the state's metadata
// not used as of 6/24/20 ...but might need...?
export const stateMetadataProp = (stateObj, propName) => metadataGetterSetter(stateMetadataLens, propName)(stateObj);

// get/set totalRows from the state structure
export const stateTotalRows = metadataGetterSetter(stateMetadataLens, 'totalRows');

// get/set totalColumns from the state structure
export const stateTotalColumns = metadataGetterSetter(stateMetadataLens, 'totalColumns');

// get/set parentSheetId from the state structure
export const stateParentSheetId = metadataGetterSetter(stateMetadataLens, 'parentSheetId');

// get/set columnVisibility from the state structure
export const stateColumnVisibility = metadataGetterSetter(stateMetadataLens, 'columnVisibility');

// get/set rowVisibility from the state structure
export const stateRowVisibility = metadataGetterSetter(stateMetadataLens, 'rowVisibility');

// get/set columnFilters from the state structure
export const stateColumnFilters = metadataGetterSetter(stateMetadataLens, 'columnFilters');

// get/set rowFilters from the state structure
export const stateRowFilters = metadataGetterSetter(stateMetadataLens, 'rowFilters');

// get/set hasChanged from the state structure
export const stateHasChanged = metadataGetterSetter(stateMetadataLens, 'hasChanged');

// get/set rowMoved from the state structure
export const stateRowMoved = metadataGetterSetter(stateMetadataLens, 'rowMoved');

// get/set rowMovedTo from the state structure
export const stateRowMovedTo = metadataGetterSetter(stateMetadataLens, 'rowMovedTo');

// get/set columnMoved from the state structure
export const stateColumnMoved = metadataGetterSetter(stateMetadataLens, 'columnMoved');

// get/set columnMovedTo from the state structure
export const stateColumnMovedTo = metadataGetterSetter(stateMetadataLens, 'columnMovedTo');
