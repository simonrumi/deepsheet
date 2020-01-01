import React, { Component } from 'react';
import { connect } from 'react-redux';
import { indexToRowNumber, extractRowColFromCellKey } from '../../helpers';
import { toggledShowFilterModal } from '../../actions';
import IconFilter from '../atoms/IconFilter';

class RowHeader extends Component {
	constructor(props) {
		super(props);
		this.showFilterModalForRow = this.showFilterModalForRow.bind(this);
	}

	showFilterModalForRow = rowIndex => this.props.toggledShowFilterModal(rowIndex, null);

	renderRowHeader(cellKey) {
		const { row } = extractRowColFromCellKey(cellKey);
		const rowNum = indexToRowNumber(row);
		let classNames = 'grid-header-item h-full text-grey-blue border-t border-l ';
		if (rowNum === this.props.totalRows) {
			classNames += 'border-b ';
		}
		return (
			<div className={classNames}>
				{rowNum}
				<IconFilter
					classes={'flex-1 h-3 w-3'}
					onClickFn={() => this.showFilterModalForRow(row)}
					testId={'row' + rowNum}
				/>
			</div>
		);
	}

	render() {
		return this.renderRowHeader(this.props.cellKey);
	}
}

function mapStateToProps(state, ownProps) {
	return {
		showFilterModal: state.showFilterModal,
		cellKey: ownProps.cellKey,
		totalRows: state.sheet.totalRows,
	};
}

export default connect(
	mapStateToProps,
	{ toggledShowFilterModal }
)(RowHeader);
