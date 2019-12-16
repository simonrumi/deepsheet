import React, { Component } from 'react';
import { connect } from 'react-redux';
import Button from '../atoms/Button';
import SortOptions from '../molecules/SortOptions';

class FilterModal extends Component {
	render() {
		if (this.props.showFilterModal) {
			return (
				<div className="filter-modal">
					<SortOptions
						classes=""
						onClickAtoZ={() => alert('onClickAtoZ button clicked')}
						onClickZtoA={() => alert('onClickZtoA button clicked')}
					/>
					<Button
						classes="ui mini blue basic button"
						onClickFn={() => alert('OK button clicked')}
						label="OK"
					/>
					<Button
						classes="ui mini red basic button"
						onClickFn={() => alert('cancel button clicked')}
						label="Cancel"
					/>
				</div>
			);
		}
		return null;
	}
}

function mapStateToProps(state, ownProps) {
	return {
		sheet: state.sheet, // might not really need this
		showFilterModal: state.filterModal.showFilterModal,
	};
}

export default connect(
	mapStateToProps,
	{}
)(FilterModal);
