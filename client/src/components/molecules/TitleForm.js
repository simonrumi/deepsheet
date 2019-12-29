import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { updatedTitle } from '../../actions';
import Button from '../atoms/Button';
import TextInput from './TextInput';

export class TitleForm extends Component {
   constructor(props) {
      super(props);
      this.editTitle = this.editTitle.bind(this);
   }

   render() {
      //console.log('TitleForm props, most from reduxForm:', this.props);
      return (
         <form
            className="flex items-start justify-between px-2 py-1"
            onSubmit={this.props.handleSubmit(this.editTitle)}
            data-testid="titleForm"
         >
            <Field name="title" component={this.renderInput} />
            <div className="flex items-center">
               <Button
                  buttonType="submit"
                  label="update"
                  disabled={this.props.pristine || this.props.submitting}
                  testId="titleSubmit"
               />
               <Button
                  classes="pl-2"
                  buttonType="cancel"
                  label="cancel"
                  onClickFn={this.props.reset}
                  testId="titleCancel"
               />
            </div>
         </form>
      );
   }

   renderInput = formProps => {
      return <TextInput formProps={formProps} testId="titleInput" />;
   };

   editTitle = formValues => {
      this.props.updatedTitle({
         text: formValues.title,
         isEditingTitle: false,
      });
   };
}

const validateForm = formValues => {
   const errors = {};
   if (!formValues.title) {
      errors.title = 'please enter a title';
   }
   return errors;
};

// reminder: reduxForm() is similar to connect()
// once we do reduxForm()(TitleForm), we get a ton of props provided by reduxForm
// including this.props.reset .handleSubmit, .pristine, .submitting, and others used above
const reduxTitleForm = reduxForm({
   form: 'titleForm', //a name for this form that shows up in the redux store
   validate: validateForm,
})(TitleForm);

const mapStateToProps = (state, ownProps) => {
   return {
      title: state.title,
      initialValues: { title: ownProps.title },
   };
};

export default connect(
   mapStateToProps,
   { updatedTitle }
)(reduxTitleForm);
