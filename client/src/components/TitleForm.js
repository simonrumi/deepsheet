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
		console.log('props from reduxForm:', this.props);
		return (
			<div className="edit-title-container">
				<form className="ui form error" onSubmit={this.props.handleSubmit(this.editTitle)}>
					<div className="ui grid">
						<div className="twelve wide column">
							<Field name="title" component={this.renderInput} />
						</div>
						<div className="right aligned two wide column">
							<button
								className="ui button primary"
								type="submit"
								disabled={this.props.pristine || this.props.submitting}
							>
								update
							</button>
						</div>
						<div className="right aligned two wide column">
							<button className="ui red button" type="cancel">
								should cancel
							</button>
						</div>
					</div>
				</form>
			</div>
		);
	}

	renderInput = formProps => {
		console.log('formProps.input.value:', formProps.input.value);
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
		const sheetWithNewTitle = { ...this.props.sheet };
		sheetWithNewTitle.metadata.title = formValues.title;
		this.props.updateTitle(sheetWithNewTitle);
		this.props.setEditingTitle(false);
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
		sheet: state.sheet,
		initialValues: { title: ownProps.title },
	};
};

export default connect(
	mapStateToProps,
	{ updateTitle, setEditingTitle }
)(reduxTitleForm);
