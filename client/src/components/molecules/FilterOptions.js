import React, { useState } from 'react';
import * as R from 'ramda';
import { useSelector } from 'react-redux';
import Label from '../atoms/Label';
import TextInput from './TextInput';
import Checkbox from './Checkbox';
import Button from '../atoms/Button';
import ErrorText from '../atoms/ErrorText';
import {
   clearedAllFilters,
   updatedFilter,
   changedFilterValue,
   changedRegexValue,
   changedCaseSensitiveValue,
} from '../../actions/filterActions';
import { isSomething, isNothing } from '../../helpers';
import { 
   stateFilterRowIndex,
   stateFilterColumnIndex,
   stateFilterExpression,
   stateFilterCaseSensitive,
   stateFilterRegex,
   stateFilterIsStale
} from '../../helpers/dataStructureHelpers';

const FilterOptions = props => {
   const rowIndex = useSelector(state => stateFilterRowIndex(state));
   const columnIndex = useSelector(state => stateFilterColumnIndex(state));
   const filterExpression = useSelector(state => stateFilterExpression(state));
   const caseSensitive = useSelector(state => isNothing(stateFilterCaseSensitive(state)) ? false : stateFilterCaseSensitive(state));
   const regex = useSelector(state => isNothing(stateFilterRegex(state)) ? false : stateFilterRegex(state));
   const isStale = useSelector(state => stateFilterIsStale(state));
   const [errors, setErrors] = useState({ filterExpression: '', caseSensitive: '', regex: '' });

   const validateFormValues = () => {
      //specifically disallow alert box code
      if (/alert\(.*\)/.test(filterExpression)) {
         setErrors({...errors, filterExpression: 'do not enter code' });
         return false;
      }
      setErrors({...errors, filterExpression: '' });
      return true;
   };

   const hasErrors = errors => R.reduce(
      (accumulator, error) => accumulator || isSomething(error), 
      false, 
      R.values(errors)
   );

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

   const submitDisabled = () => !isStale || hasErrors(errors);

   const handleBlur = event => {
      event.preventDefault();
      validateFormValues();
   }

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
         'border-t border-r border-b border-l border-solid border-grey-blue flex items-start justify-between px-2 py-2 ' +
         props.classes;
      return (
         <form onSubmit={handleSubmit}>
            <div className={allClasses}>
               <Label label="Filter" />
               <div>
                  <TextInput 
                     props={{ 
                        changeHandler: handleChangeFilter, 
                        value: filterExpression || '', 
                        blurHandler: handleBlur, 
                        error: errors.filterExpression
                     }} 
                  />
                  <ErrorText error={errors.filterExpression} />

                  <div className="flex items-center px-2 py-2">
                     <Checkbox 
                        classes="pl-0" 
                        changeHandler={handleChangeCaseSensitive}
                        value={caseSensitive}
                        blurHandler={handleBlur}
                     />
                     <Label label="Case sensitive" classes="pl-2" />
                  </div>
                  <ErrorText error={errors.caseSensitive} />

                  <div className="flex items-center px-2 py-2">
                     <Checkbox
                        changeHandler={handleChangeRegex} 
                        value={regex}
                        blurHandler={handleBlur}
                     />
                     <Label label="Regular expression" classes="pl-2" />
                  </div>
                  <ErrorText error={errors.regex} />
                  <div className="flex items-center">
                     <Button
                        buttonType="submit"
                        classes="pr-2"
                        label="Filter it!"
                        disabled={submitDisabled}
                     />
                     <Button 
                           buttonType="button" 
                           classes="" 
                           onClickFn={clearedAllFilters} 
                           label="Clear All Filtering" 
                        />
                  </div>
               </div>
            </div>
         </form>
      );
   }

   return render();
}

export default FilterOptions;
