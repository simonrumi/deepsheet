import React from 'react';
import { useSelector } from 'react-redux';
import * as R from 'ramda';
import { stateShowFilterModal, stateShowLoginModal, stateShowSortModal } from '../../helpers/dataStructureHelpers';

const ModalBackground = props => {
   const modalVisible = useSelector(state => stateShowFilterModal(state) || stateShowLoginModal(state) || stateShowSortModal(state));
   const baseClasses = 'w-screen h-screen z-40 fixed top-0 left-0 bg-light-light-orange-transparent';

   // see notes in filterSheet.js addNewFilter() on how this pattern works
   const allClasses = R.useWith(
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
