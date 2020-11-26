import React, { Component } from 'react';
import { reduxForm, Field } from 'redux-form';
import { connect } from 'react-redux';
import Label from '../atoms/Label';
import TextInput from './TextInput';
import Checkbox from './Checkbox';
import Button from '../atoms/Button';
import { clearedAllFilters, updatedFilter } from '../../actions';
import { isSomething, getObjectFromArrayByKeyValue } from '../../helpers';
import {
   stateRowFilters,
   stateColumnFilters,
   stateFilterRowIndex,
   stateFilterColumnIndex,
   stateShowFilterModal,
} from '../../helpers/dataStructureHelpers';

// TODO: BUG 
// when cancel is clicked in the form, the metadata isStale gets set...which it shouldn;t
// perhaps first should get rid of redux-form

class FilterOptions extends Component {
   constructor(props) {
      super(props);
      this.editFilter = this.editFilter.bind(this);
   }

   editFilter = formValues => {
      this.props.updatedFilter({
         filterExpression: formValues.filterExpression,
         caseSensitive: formValues.caseSensitive,
         regex: formValues.regex,
         showFilterModal: false,
         rowIndex: this.props.rowIndex,
         columnIndex: this.props.columnIndex,
      });
   };

   renderRegexCheckbox = formProps => <Checkbox formProps={formProps} testId="regexCheckbox" />;

   renderFilterInput = formProps => {
      console.log('FilterOptions.renderFilterInput got formProps', formProps); // TODO BUG - this line not even getting called when values entered into the form
      return (
         <TextInput formProps={formProps} testId="filterInput" placeholder="placeholder value here" />
      );
   }

   renderCaseSensitiveCheckbox = formProps => <Checkbox formProps={formProps} testId="caseSensitiveCheckbox" />;

   renderClearFiltersButton = formProps => (
      <Button buttonType="button" classes="" onClickFn={this.props.clearedAllFilters} label="Clear All Filtering" />
   );

   render() {
      const allClasses =
         'border-t-0 border-r border-b border-l border-solid border-grey-blue flex items-start justify-between px-2 py-2 ' +
         this.props.classes;

      return (
         <form onSubmit={this.props.handleSubmit(this.editFilter)}>
            <div className={allClasses}>
               <Label label="Filter" />
               <div>
                  <Field name="filterExpression" component={this.renderFilterInput} />
                  <div className="flex items-center px-2 py-2">
                     <Field name="caseSensitive" component={this.renderCaseSensitiveCheckbox} classes="pl-0" />
                     <Label label="Case sensitive" classes="pl-2" />
                  </div>
                  <div className="flex items-center px-2 py-2">
                     <Field name="regex" component={this.renderRegexCheckbox} />
                     <Label label="Regular expression" classes="pl-2" />
                  </div>
                  <div className="flex items-center py-2">
                     <Field name="filterClearAll" component={this.renderClearFiltersButton} />
                  </div>
                  <div className="flex items-center">
                     <Button
                        buttonType="submit"
                        classes="pr-2"
                        label="OK"
                        disabled={this.props.pristine || this.props.submitting}
                     />
                     <Button buttonType="cancel" classes="" onClickFn={this.props.reset} label="Cancel" />
                  </div>
               </div>
            </div>
         </form>
      );
   }
}

const validateForm = formValues => {
   const errors = {};
   // add error checking here, object keys should be the same as the Field names
   console.log('TODO: filterOptions.js validateForm() should make sure there is no executable code being entered');
   return errors;
};

const filterForm = reduxForm({
   form: 'filterForm', // a name for the form that shows up in the redux store
   validate: validateForm,
})(FilterOptions);

const getInitialFilterValues = state => {
   const existingColumnFilter = getObjectFromArrayByKeyValue(
      'index',
      stateFilterColumnIndex(state),
      stateColumnFilters(state)
   );
   if (isSomething(existingColumnFilter)) {
      return existingColumnFilter;
   }
   const existingRowFilter = getObjectFromArrayByKeyValue('index', stateFilterRowIndex(state), stateRowFilters(state));
   if (isSomething(existingRowFilter)) {
      return existingRowFilter;
   }
   return null;
};

function mapStateToProps(state, ownProps) {
   return {
      showFilterModal: stateShowFilterModal(state),
      rowIndex: stateFilterRowIndex(state),
      columnIndex: stateFilterColumnIndex(state),
      initialValues: getInitialFilterValues(state), // TODO not using this????
   };
}

export default connect(mapStateToProps, { updatedFilter, clearedAllFilters })(filterForm);
