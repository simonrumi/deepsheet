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
			<div className="edit-title-container">
				<form className="ui form error" onSubmit={this.props.handleSubmit(this.editTitle)}>
					<div className="ui grid">
						<div className="thirteen wide column">
							<Field name="title" component={this.renderInput} />
						</div>
						<div className="right aligned three wide column">
							<button
								className="ui mini button primary"
								type="submit"
								disabled={this.props.pristine || this.props.submitting}
							>
								update
							</button>
							<button className="ui mini red button" type="cancel" onClick={this.props.reset}>
								cancel
							</button>
						</div>
					</div>
				</form>
			</div>
		);
	}

	renderInput = formProps => {
		const className = `field ${formProps.meta.error && formProps.meta.touched ? 'error' : ''}`;
		return (
			<div className={className}>
				<input {...formProps.input} autoComplete="off" type="text" />
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
