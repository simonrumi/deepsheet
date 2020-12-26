import React, { useState, useEffect } from 'react';
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
   filterEditCancelled
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

   // TODO - the useEffect(isStale => etc) thing below is weird and probably not the way to do things. read about 
   // - useCallback ..but tried this, didn't seem to solve the issue, just moved the warning to useCallback instead of useEffect
   // - custom hooks
   // both here https://wanago.io/2019/11/18/useeffect-hook-in-react-custom-hooks/
   //  and in the react docs

   // rare case of using local state to track what the isStale prop was as we open the filter modal
   // this is so it can be reinstated if we cancel out of the filter modal
   const [wasStale, setWasStale] = useState(false);
   useEffect(isStale => setWasStale(isStale), []); // equivalent to componentDidMount per https://medium.com/@felippenardi/how-to-do-componentdidmount-with-react-hooks-553ba39d1571

   const [errors, setErrors] = useState({ filterExpression: '', caseSensitive: '', regex: '' });

   const handleCancel = event => {
      event.preventDefault();
      filterEditCancelled(wasStale);
   };

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
         'border-t-0 border-r border-b border-l border-solid border-grey-blue flex items-start justify-between px-2 py-2 ' +
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
                        props={{ 
                           changeHandler: handleChangeCaseSensitive, 
                           value: caseSensitive, 
                           blurHandler: handleBlur 
                        }}
                     />
                     <Label label="Case sensitive" classes="pl-2" />
                  </div>
                  <ErrorText error={errors.caseSensitive} />

                  <div className="flex items-center px-2 py-2">
                     <Checkbox 
                        props={{ 
                           changeHandler: handleChangeRegex, 
                           value: regex, 
                           blurHandler: handleBlur 
                        }}
                     />
                     <Label label="Regular expression" classes="pl-2" />
                  </div>
                  <ErrorText error={errors.regex} />

                  <div className="flex items-center py-2">
                     <Button 
                        buttonType="button" 
                        classes="" 
                        onClickFn={clearedAllFilters} 
                        label="Clear All Filtering" 
                     />
                  </div>
                  <div className="flex items-center">
                     <Button
                        buttonType="submit"
                        classes="pr-2"
                        label="OK"
                        disabled={submitDisabled}
                     />
                     <Button 
                        buttonType="cancel" 
                        classes="" 
                        onClickFn={handleCancel} 
                        label="Cancel" 
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
