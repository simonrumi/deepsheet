import managedStore from '../store';
import {
	UPDATED_INFO_MODAL_VISIBILITY,
	UPDATED_INFO_MODAL_CONTENT
} from './infoModalTypes';

export const updatedInfoModalVisibility = visibility => {
   managedStore.store.dispatch({
      type: UPDATED_INFO_MODAL_VISIBILITY,
      payload: visibility,
   });
};

export const updatedInfoModalContent = content => {
	managedStore.store.dispatch({
	   type: UPDATED_INFO_MODAL_CONTENT,
	   payload: content,
	});
 };