import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Label from '../atoms/Label';
import TextInput from './TextInput';
import Checkbox from './Checkbox';
import Button from '../atoms/Button';
import {
   clearedAllFilters,
   updatedFilter,
   changedFilterValue,
   changedRegexValue,
   changedCaseSensitiveValue,
   filterEditCancelled
} from '../../actions/filterActions';
import { isNothing } from '../../helpers';
import { 
   stateFilterRowIndex,
   stateFilterColumnIndex,
   stateFilterExpression,
   stateFilterCaseSensitive,
   stateFilterRegex,
   stateFilterIsStale
} from '../../helpers/dataStructureHelpers';

// TODO
// - validation
// - error display

const FilterOptions = props => {
   const rowIndex = useSelector(state => stateFilterRowIndex(state));
   const columnIndex = useSelector(state => stateFilterColumnIndex(state));
   const filterExpression = useSelector(state => stateFilterExpression(state));
   const caseSensitive = useSelector(state => isNothing(stateFilterCaseSensitive(state)) ? false : stateFilterCaseSensitive(state));
   const regex = useSelector(state => isNothing(stateFilterRegex(state)) ? false : stateFilterRegex(state));
   const isStale = useSelector(state => stateFilterIsStale(state));

   // rare case of using local state to track what the isStale prop was as we open the filter modal
   // this is so it can be reinstated if we cancel out of the filter modal
   const [wasStale, setWasStale] = useState(false);
   useEffect(isStale => setWasStale(isStale), []); // equivalent to componentDidMount per https://medium.com/@felippenardi/how-to-do-componentdidmount-with-react-hooks-553ba39d1571

   const handleCancel = event => {
      event.preventDefault();
      filterEditCancelled(wasStale);
   };

   const handleSubmit = event => {
      event.preventDefault();
      updatedFilter({
         filterExpression,
         caseSensitive,
         regex,
         showFilterModal: false,
         rowIndex,
         columnIndex,
      });
   };

   const submitDisabled = () => !isStale;

   const handleChangeCaseSensitive = event => {
      event.preventDefault();
      changedCaseSensitiveValue(!JSON.parse(event.target.value)); // the value should be "true" or "false", so toggle it
   }

   const handleChangeRegex = event => {
      event.preventDefault();
      changedRegexValue(!JSON.parse(event.target.value)); // the value should be "true" or "false", so toggle it
   }

   const handleChangeFilter = event => {
      event.preventDefault();
      changedFilterValue(event.target.value);
   }

   const render = () => {
      const allClasses =
         'border-t-0 border-r border-b border-l border-solid border-grey-blue flex items-start justify-between px-2 py-2 ' +
         props.classes;
      return (
         <form onSubmit={handleSubmit}>
            <div className={allClasses}>
               <Label label="Filter" />
               <div>
                  <TextInput props={{ changeHandler: handleChangeFilter, value: filterExpression || '' }} />
                  <div className="flex items-center px-2 py-2">
                     <Checkbox classes="pl-0" props={{ changeHandler: handleChangeCaseSensitive, value: caseSensitive }}/>
                     <Label label="Case sensitive" classes="pl-2" />
                  </div>
                  <div className="flex items-center px-2 py-2">
                     <Checkbox props={{ changeHandler: handleChangeRegex, value: regex }}/>
                     <Label label="Regular expression" classes="pl-2" />
                  </div>
                  <div className="flex items-center py-2">
                     <Button buttonType="button" classes="" onClickFn={clearedAllFilters} label="Clear All Filtering" />
                  </div>
                  <div className="flex items-center">
                     <Button
                        buttonType="submit"
                        classes="pr-2"
                        label="OK"
                        disabled={submitDisabled}
                     />
                     <Button buttonType="cancel" classes="" onClickFn={handleCancel} label="Cancel" />
                  </div>
               </div>
            </div>
         </form>
      );
   }

   /* const validateForm = formValues => {
      const errors = {};
      // add error checking here, object keys should be the same as the Field names
      console.log('TODO: filterOptions.js validateForm() should make sure there is no executable code being entered');
      return errors;
   }; */

   return render();
}

export default FilterOptions;
