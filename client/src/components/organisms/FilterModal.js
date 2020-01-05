import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { updatedFilter } from '../../actions';
import Button from '../atoms/Button';
import SortOptions from '../molecules/SortOptions';
import FilterOptions from '../molecules/FilterOptions';

class FilterModal extends Component {
	constructor(props) {
		super(props);
		this.editFilter = this.editFilter.bind(this);
	}

	render() {
		if (this.props.showFilterModal) {
			return (
				<form
					className="fixed top-1/3 left-1/3 w-1/2 md:w-1/3 border border-solid border-grey-blue bg-white shadow-lg px-2 py-2"
					onSubmit={this.props.handleSubmit(this.editFilter)}
				>
					<SortOptions
						classes=""
						onClickAtoZ={() => alert('onClickAtoZ button clicked')}
						onClickZtoA={() => alert('onClickZtoA button clicked')}
					/>
					<FilterOptions />
					<div className="flex items-center justify-around px-2 py-1">
						<Button
							buttonType="submit"
							classes=""
							label="OK"
							disabled={this.props.pristine || this.props.submitting}
						/>
						<Button buttonType="cancel" classes="" onClickFn={this.props.reset} label="Cancel" />
					</div>
				</form>
			);
		}
		return null;
	}

	editFilter = formValues => {
		this.props.updatedFilter({
			filterExpression: formValues.filterExpression,
			caseSensitive: formValues.caseSensitiveCheckbox,
			regex: formValues.regexCheckbox,
			showFilterModal: false,
			rowIndex: this.props.rowIndex,
			colIndex: this.props.colIndex,
		});
	};
}

const validateForm = formValues => {
	const errors = {};
	// add error checking here, object keys should be the same as the Field names
	return errors;
};

const filterForm = reduxForm({
	form: 'filterForm', // a name for the form that shows up in the redux store
	validate: validateForm,
})(FilterModal);

function mapStateToProps(state, ownProps) {
	return {
		sheet: state.sheet, // might not really need this
		showFilterModal: state.filterModal.showFilterModal,
		rowIndex: state.filterModal.rowIndex,
		colIndex: state.filterModal.colIndex,
	};
}

export default connect(
	mapStateToProps,
	{ updatedFilter }
)(filterForm);
