// TODO get other metadata stuff in here, such as
// HAS_CHANGED_METADATA

import { updateMetadataMutation } from '../queries/metadataMutations';

import managedStore from '../store';
import { POSTING_UPDATED_METADATA, COMPLETED_SAVE_METADATA, METADATA_UPDATE_FAILED } from './metadataTypes';

export const updatedMetadata = async updatedMetadata => {
   managedStore.store.dispatch({
      type: POSTING_UPDATED_METADATA,
   });
   try {
      const { sheetId, changedMetadata } = updatedMetadata;
      const response = await updateMetadataMutation({ ...changedMetadata, id: sheetId });
      managedStore.store.dispatch({
         type: COMPLETED_SAVE_METADATA,
         payload: {
            updatedMetadata: response.data.updateMetada,
            lastUpdated: Date.now(),
         },
      }); //note that "updateMetada" is the name of the mutation in metadataMutation.js
   } catch (err) {
      console.error('Did not successfully update the metadata in the db:', err);
      managedStore.store.dispatch({
         type: METADATA_UPDATE_FAILED,
         payload: { errorMessage: 'metadata was not updated in the db: ' + err },
      });
   }
};
