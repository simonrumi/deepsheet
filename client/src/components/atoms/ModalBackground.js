import React from 'react';
import { useSelector } from 'react-redux';
import * as R from 'ramda';
import { isSomething } from '../../helpers';
import {
   stateShowFilterModal,
   stateShowLoginModal,
   stateShowSortModal,
   stateShowPasteOptionsModal,
   stateMetadataErrorMessage,
} from '../../helpers/dataStructureHelpers';

// this is to avoid an issue with React's compiler which thinks any function starting with "use" is a hook
const rUseWith = R.useWith;

const ModalBackground = () => {
   const modalVisible = useSelector(
      state => stateShowFilterModal(state) 
         || stateShowLoginModal(state) 
         || stateShowSortModal(state)
			|| stateShowPasteOptionsModal(state)
         || isSomething(stateMetadataErrorMessage(state))
   );
   const baseClasses = 'w-screen h-screen z-40 fixed top-0 left-0 bg-light-light-orange-transparent';

   const allClasses = rUseWith(
         R.ifElse, 
         [
            R.thunkify(R.not), 
            R.thunkify(R.concat(R.__, ' hidden')), 
            R.thunkify(R.identity)
         ]
      )(modalVisible, baseClasses, baseClasses)();

   return <div className={allClasses} />;
}

export default ModalBackground;
