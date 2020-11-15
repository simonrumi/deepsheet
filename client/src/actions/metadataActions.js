// TODO get other metadata stuff in here, such as
// HAS_CHANGED_METADATA

// import { updateMetadataMutation } from '../queries/metadataMutations';

import managedStore from '../store';
import { POSTING_UPDATED_METADATA, HAS_CHANGED_METADATA, } from './metadataTypes';

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
