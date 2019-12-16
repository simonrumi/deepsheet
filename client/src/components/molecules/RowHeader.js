import React, { Component } from 'react';
import { connect } from 'react-redux';
import { indexToRowNumber } from '../../helpers';
import IconFilter from '../atoms/IconFilter';

class RowHeader extends Component {
	constructor(props) {
		super(props);
		this.indexToRowNumber = indexToRowNumber.bind(this);
	}

	render() {
		return this.renderRowHeader(this.props.cellKey);
	}

	renderRowHeader(cellKey) {
		const rowRegex = /cell_(\d+)_\d+$/;
		const rowIndex = rowRegex.exec(cellKey)[1]; // [1] returns the first group captured in the regex
		const rowNum = this.indexToRowNumber(rowIndex);
		let classNames = 'grid-header-item h-full text-grey-blue border-t border-l ';
		if (rowNum === this.props.totalRows) {
			classNames += 'border-b ';
		}
		return (
			<div className={classNames}>
				{rowNum}
				<IconFilter
					classes={'flex-1 h-3 w-3'}
					onClick={event => (event.target.innerHTML = 'todo')}
					testId={'row' + rowNum}
				/>
			</div>
		);
	}
}

function mapStateToProps(state, ownProps) {
	return {
		cellKey: ownProps.cellKey,
		totalRows: state.sheet.totalRows,
	};
}

export default connect(
	mapStateToProps,
	{}
)(RowHeader);
