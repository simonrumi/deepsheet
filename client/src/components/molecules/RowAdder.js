import React, { Component } from 'react';
import * as R from 'ramda';
import { connect } from 'react-redux';
import { updatedTotalRows, updatedCellKeys } from '../../actions';
import IconAdd from '../atoms/IconAdd';

class RowAdder extends Component {
	addRowOfBlankCells = () => {
		// totalRows, being the count of rows, will give us the index of the next row
		// totalColumns gives us the number of new cells we need to create
		for (let i = 0; i < this.props.totalColumns; i++) {
			// make the cellKey
			const newCellKey = 'cell_' + this.props.totalsRows + '_' + i;

			// add the cellKey to state.cellKeys
			const newCellKeys = R.append(newCellKey, this.props.cellKeys);
			console.log('newCellKeys', newCellKeys);
			updatedCellKeys(newCellKeys); // QQQ this doesn't seem to work

			// add a cell object to state
		}
	};
	render() {
		return (
			<div className={this.props.classes} data-testid="rowAdder">
				<div className="flex items-center px-2 py-2">
					<IconAdd classes={'flex-1 h-3 w-3'} onClickFn={() => updatedTotalRows(this.props.totalRows + 1)} />
				</div>
			</div>
		);
	}
}

function mapStateToProps(state, ownProps) {
	return {
		totalRows: state.sheet.totalRows,
		totalColumns: state.sheet.totalColumns,
		cellKeys: state.sheet.cellKeys,
		classes: ownProps.classes,
	};
}

export default connect(mapStateToProps)(RowAdder);
