import * as R from 'ramda';
import React, { Component } from 'react';
import { reduxForm, Field } from 'redux-form';
import { connect } from 'react-redux';
import Label from '../atoms/Label';
import TextInput from './TextInput';
import Checkbox from './Checkbox';
import Button from '../atoms/Button';
import { clearedAllFilters, updatedFilter } from '../../actions';
import { maybeHasPath } from '../../helpers';

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
         colIndex: this.props.colIndex,
      });
   };

   renderRegexCheckbox = formProps => (
      <Checkbox formProps={formProps} testId="regexCheckbox" />
   );

   renderFilterInput = formProps => (
      <TextInput
         formProps={formProps}
         testId="filterInput"
         placeholder="placeholder value here"
      />
   );

   renderCaseSensitiveCheckbox = formProps => (
      <Checkbox formProps={formProps} testId="caseSensitiveCheckbox" />
   );

   renderClearFiltersButton = formProps => (
      <Button
         buttonType="button"
         classes=""
         onClickFn={this.props.clearedAllFilters}
         label="Clear All Filtering"
      />
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
                  <Field
                     name="filterExpression"
                     component={this.renderFilterInput}
                  />
                  <div className="flex items-center px-2 py-2">
                     <Field
                        name="caseSensitive"
                        component={this.renderCaseSensitiveCheckbox}
                        classes="pl-0"
                     />
                     <Label label="Case sensitive" classes="pl-2" />
                  </div>
                  <div className="flex items-center px-2 py-2">
                     <Field name="regex" component={this.renderRegexCheckbox} />
                     <Label label="Regular expression" classes="pl-2" />
                  </div>
                  <div className="flex items-center py-2">
                     <Field
                        name="filterClearAll"
                        component={this.renderClearFiltersButton}
                     />
                  </div>
                  <div className="flex items-center">
                     <Button
                        buttonType="submit"
                        classes="pr-2"
                        label="OK"
                        disabled={this.props.pristine || this.props.submitting}
                     />
                     <Button
                        buttonType="cancel"
                        classes=""
                        onClickFn={this.props.reset}
                        label="Cancel"
                     />
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
   return errors;
};

const filterForm = reduxForm({
   form: 'filterForm', // a name for the form that shows up in the redux store
   validate: validateForm,
})(FilterOptions);

function mapStateToProps(state, ownProps) {
   const columnFilters = maybeHasPath(
      ['columnFilters', R.toString(state.filterModal.colIndex)],
      state.sheet
   );
   const rowFilters = maybeHasPath(
      ['rowFilters', R.toString(state.filterModal.rowIndex)],
      state.sheet
   );
   const initialFilterValues = columnFilters || rowFilters;

   return {
      showFilterModal: state.filterModal.showFilterModal,
      rowIndex: state.filterModal.rowIndex,
      colIndex: state.filterModal.colIndex,
      initialValues: initialFilterValues,
   };
}

export default connect(
   mapStateToProps,
   { updatedFilter, clearedAllFilters }
)(filterForm);
