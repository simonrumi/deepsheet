import { isNothing } from '../helpers';
import {
   TOGGLED_SHOW_FILTER_MODAL,
   CHANGED_FILTER_VALUE,
   CHANGED_REGEX_VALUE,
   CHANGED_CASE_SENSITIVE_VALUE,
   FILTER_EDIT_CANCELLED,
} from '../actions/filterTypes';

const filterModalReducer = (state = { showFilterModal: false }, action) => {
   switch (action.type) {
      case TOGGLED_SHOW_FILTER_MODAL:
         const modalHiddenState = {
            ...state, 
            showFilterModal: false,
            rowIndex: null,
            colIndex: null,
            filterExpression: null, 
            regex: null,
            caseSensitive: null
         }

         if (isNothing(action.payload)) {
            return modalHiddenState;
         }

         const { showModal, rowIndex, colIndex, initialValues } = action.payload;

         if (!showModal) {
            return modalHiddenState;
         }

         const { filterExpression, regex, caseSensitive } = initialValues
            ? initialValues
            : { filterExpression: null, regex: null, caseSensitive: null };

         return {
            ...state,
            showFilterModal: true,
            rowIndex,
            colIndex,
            filterExpression, 
            regex,
            caseSensitive,
         }
         
      case CHANGED_FILTER_VALUE:
         return { ...state, filterExpression: action.payload, isStale: true }

      case CHANGED_REGEX_VALUE:
         console.log('filterModalReducer CHANGED_CASE_SENSITIVE_VALUE got action.payload', action.payload);
         return { ...state, regex: action.payload, isStale: true }

      case CHANGED_CASE_SENSITIVE_VALUE:
         console.log('filterModalReducer CHANGED_CASE_SENSITIVE_VALUE got action.payload', action.payload);
         return { ...state, caseSensitive: action.payload, isStale: true }
    
      case FILTER_EDIT_CANCELLED:
         return {
            ...state,
            rowIndex: null,
            colIndex: null,
            filterExpression: null, 
            regex: null,
            caseSensitive: null,
            initialValues: null,
            showFilterModal: false,
            isStale: action.payload,
         };

      default:
         return state;
   }
};

export default filterModalReducer;