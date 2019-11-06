import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { updateTitle, setEditingTitle } from '../actions';

export class TitleForm extends React.Component {
   constructor(props) {
      super(props);
      this.editTitle = this.editTitle.bind(this);
   }

   render() {
      return (
         <div className="edit-title-container" data-testid="titleForm">
            <form
               className="ui form error"
               onSubmit={this.props.handleSubmit(this.editTitle)}
            >
               <div className="ui grid">
                  <div className="twelve wide column">
                     <Field name="title" component={this.renderInput} />
                  </div>
                  <div className="right aligned four wide column">
                     <span>
                        <button
                           className="ui mini blue basic button"
                           type="submit"
                           disabled={
                              this.props.pristine || this.props.submitting
                           }
                        >
                           update
                        </button>
                     </span>
                     <span>
                        <button
                           className="ui mini red basic button"
                           type="cancel"
                           onClick={this.props.reset}
                        >
                           cancel
                        </button>
                     </span>
                  </div>
               </div>
            </form>
         </div>
      );
   }

   renderInput = formProps => {
      const className = `field ${
         formProps.meta.error && formProps.meta.touched ? 'error' : ''
      }`;
      return (
         <div className={className}>
            <input
               {...formProps.input}
               autoComplete="off"
               type="text"
               data-testid="titleInput"
            />
            {this.renderError(formProps.meta)}
         </div>
      );
   };

   renderError({ error, touched }) {
      if (touched && error) {
         return <div className="ui error">{error}</div>;
      }
   }

   editTitle = formValues => {
      this.props.updateTitle({ text: formValues.title, isEditingTitle: false });
   };
}

const validateForm = formValues => {
   const errors = {};
   if (!formValues.title) {
      errors.title = 'please enter a title';
   }
   return errors;
};

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
   { updateTitle, setEditingTitle }
)(reduxTitleForm);
