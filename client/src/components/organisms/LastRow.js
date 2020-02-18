import React, { Component } from 'react';
import * as R from 'ramda';
import { connect } from 'react-redux';
import { COLUMN_AXIS } from '../../constants';
import { getRequiredNumItemsForAxis } from '../../helpers/visibilityHelpers';
import RowAdder from '../molecules/RowAdder';

class LastRow extends Component {
	generateKey = num => 'lastRow_' + num;

	makeLastRowArray = (totalColumns, index = 0, cells = []) => {
		if (index === totalColumns) {
			return cells;
		}
		if (index === 0) {
			return R.prepend(
				<RowAdder key="rowAdder" classes="grid-item text-dark-dark-blue border-t border-b border-l border-r" />,
				this.makeLastRowArray(totalColumns, index + 1, cells)
			);
		} else {
			return R.prepend(
				<div className="grid-item border-t border-b border-r" key={this.generateKey(index)} />,
				this.makeLastRowArray(totalColumns, index + 1, cells)
			);
		}
	};

	render() {
		return R.pipe(
			getRequiredNumItemsForAxis, // will get the number of non-hidden columns
			R.add(2), // for the RowHeader and the last, empty cell
			this.makeLastRowArray
		)(COLUMN_AXIS, this.props.sheet);
	}
}

function mapStateToProps(state, ownProps) {
	return {
		sheet: state.sheet,
		totalColumns: state.sheet.totalColumns,
		columnVisibility: state.sheet.columnVisibility,
	};
}

export default connect(mapStateToProps)(LastRow);
