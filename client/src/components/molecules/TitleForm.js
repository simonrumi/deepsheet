import React from 'react';
import { useSelector } from 'react-redux';
import {
   changedTitleValue,
   updatedTitle,
   titleEditCancelled,
   titleErrorDetected,
} from '../../actions/titleActions';
import { isSomething, isNothing } from '../../helpers';
import {
   stateSheetId,
   stateTitleText,
   stateTitleErrorMessage,
   stateTitleIsCallingDb,
   stateTitleIsStale,
} from '../../helpers/dataStructureHelpers';
import Button from '../atoms/Button';
import TextInput from './TextInput';
import ErrorText from '../atoms/ErrorText';

const TitleForm = props => {
   const sheetId = useSelector(state => stateSheetId(state));
   const titleError = useSelector(state => stateTitleErrorMessage(state));
   const titleText = useSelector(state => stateTitleText(state));
   const isCallingDb = useSelector(state => stateTitleIsCallingDb(state));
   const isStale = useSelector(state => stateTitleIsStale(state));

   const handleCancel = event => {
      event.preventDefault();
      titleEditCancelled();
   };

   const validateFormValue = text => {
      if (isNothing(text)) {
         titleErrorDetected('please enter a title');
         return false;
      }
      titleErrorDetected('');
      return true;
   };

   const handleSubmit = event => {
      event.preventDefault();
      updatedTitle(titleText);
   };

   const handleBlur = event => {
      event.preventDefault();
      // don't really need this?
   }

   const handleChange = event => {
      event.preventDefault();
      changedTitleValue(event.target.value);
      validateFormValue(event.target.value);
   }

   const submitDisabled = () =>  !isStale || isCallingDb || isSomething(titleError);
   const cancelDisabled = () => isCallingDb;

   const render = () => {
      return (
         <form
            className="flex items-start justify-between px-2 py-1"
            onSubmit={handleSubmit}
            data-testid="titleForm">
            <div className="flex flex-col w-full">
               <TextInput 
                  props={{ 
                     changeHandler: handleChange, 
                     value: titleText, 
                     blurHandler: handleBlur,
                  }} 
               />
               <ErrorText error={isSomething(titleError) ? titleError : ''} />
            </div>
            <div className="flex flex-col">
               <div className="flex items-center">
                  <Button
                     buttonType="submit"
                     label="update"
                     disabled={submitDisabled}
                  />
                  <Button
                     classes="pl-2"
                     buttonType="cancel"
                     label="cancel"
                     disabled={cancelDisabled}
                     onClickFn={handleCancel}
                  />
               </div>
            </div>
         </form>
      );
   }

   return render();
}

export default TitleForm;
