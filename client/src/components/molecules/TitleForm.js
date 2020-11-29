import React from 'react';
import { useSelector } from 'react-redux';
import { changedTitleValue, updatedTitle, titleEditCancelled } from '../../actions/titleActions';
import { isSomething } from '../../helpers';
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

// TODO
// - validation
// - error display
// - remove redux-form

const TitleForm = props => {
   const sheetId = useSelector(state => stateSheetId(state));
   const updateTitleError = useSelector(state => stateTitleErrorMessage(state));
   const titleText = useSelector(state => stateTitleText(state));
   const isCallingDb = useSelector(state => stateTitleIsCallingDb(state));
   const isStale = useSelector(state => stateTitleIsStale(state));

   const submitNewTitle = event => {
      event.preventDefault();
      try {
         updatedTitle({
            text: titleText,
            isEditingTitle: false,
            sheetId,
         });
      } catch (err) {
         console.error('TitleForm.submitNewTitle - error updating title', err);
         throw new Error({
            title: 'title was not updated: ' + err,
         });
      }
   };

   const handleCancel = event => {
      event.preventDefault();
      titleEditCancelled();
   };

   const handleChange = event => {
      event.preventDefault();
      changedTitleValue(event.target.value);
   }

   const submitDisabled = () =>  !isStale || isCallingDb;
   const cancelDisabled = () => isCallingDb;

   const render = () => {
      return (
         <form
            className="flex items-start justify-between px-2 py-1"
            onSubmit={submitNewTitle}
            data-testid="titleForm">
            <TextInput props={{ changeHandler: handleChange, value: titleText }} />
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
               <div>
                  <ErrorText error={isSomething(updateTitleError) ? updateTitleError : ''} />
               </div>
            </div>
         </form>
      );
   }

   // TODO fake some errors and check that they display correctly
   const validateForm = formValues => {
      const errors = {};
      if (!formValues.title) {
         errors.title = 'please enter a title';
      }
      return errors;
   };

   return render();
}

export default TitleForm;
