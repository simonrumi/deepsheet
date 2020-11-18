// TODO get other metadata stuff in here, such as
// HAS_CHANGED_METADATA

import managedStore from '../store';
import { 
   POSTING_UPDATED_METADATA, 
   HAS_CHANGED_METADATA,
   UPDATED_FROZEN_ROWS, 
   UPDATED_FROZEN_COLUMNS
} from './metadataTypes';

export const updatedMetadata = async data => {
   managedStore.store.dispatch({
      type: POSTING_UPDATED_METADATA,
      payload: data,
   });
};

export const hasChangedMetadata = () => {
   managedStore.store.dispatch({
      type: HAS_CHANGED_METADATA,
   });
};

export const updatedFrozenRows = frozenRows => {
   managedStore.store.dispatch({
      type: UPDATED_FROZEN_ROWS,
      payload: frozenRows
   });
};

export const updatedFrozenColumns = frozenColumns => {
   managedStore.store.dispatch({
      type: UPDATED_FROZEN_COLUMNS,
      payload: frozenColumns
   });
};
