import React, { Component } from 'react';
import * as R from 'ramda';
import managedStore from '../../store';
import { connect } from 'react-redux';
import { updatedTotalRows, updatedCellKeys } from '../../actions';
import { createCellKey } from '../../helpers/cellHelpers';
import { cellReducerFactory } from '../../reducers/cellReducers';
import IconAdd from '../atoms/IconAdd';

class RowAdder extends Component {
	constructor(props) {
		super(props);
		this.addRowOfBlankCells = this.addRowOfBlankCells.bind(this);
	}

	addOneCellToStore = cell => {
		// TODO need to do something like this
	};

	addManyCellReducersToStore = cellReducers => {
		const combineNewReducers = managedStore.store.reducerManager.addMany(cellReducers);
		managedStore.store.replaceReducer(combineNewReducers);
	};

	addOneCellReducer = (cellKey, row, column) => {
		// TODO get this going
		//cellReducers[cellKey] = cellReducerFactory(row, column);
	};

	appendOneCellKey = (rowIndex, columnIndex, newCellKeys) =>
		R.pipe(
			createCellKey,
			R.append(R.__, newCellKeys)
		)(rowIndex, columnIndex);

	createNewCellKeys = (newCellKeys, totalColumns, rowIndex, columnIndex = 0) => {
		return R.ifElse(
			R.equals(totalColumns), // if the columnIndex === totalColumns
			R.thunkify(R.identity)(newCellKeys), // return the newCellKeys
			R.thunkify(this.createNewCellKeys)(
				// else continue to build the cellKeys array with the new row
				this.appendOneCellKey(rowIndex, columnIndex, newCellKeys),
				totalColumns,
				rowIndex,
				columnIndex + 1
			)
		)(columnIndex);
	};

	addRowOfBlankCells = () => {
		// totalRows, being the count of existing rows, will give us the index of the next row
		// totalColumns gives us the number of new cells we need to create
		R.pipe(
			this.createNewCellKeys,
			updatedCellKeys
		)(this.props.cellKeys, this.props.totalColumns, this.props.totalRows);

		// TODO, make a cell object and add it to the state
	};

	insertNewRow = () => {
		this.addRowOfBlankCells();
		updatedTotalRows(this.props.totalRows + 1);
	};
	render() {
		return (
			<div className={this.props.classes} data-testid="rowAdder">
				<div className="flex items-center px-2 py-2">
					<IconAdd classes={'flex-1 h-3 w-3'} onClickFn={this.insertNewRow} />
				</div>
			</div>
		);
	}
}

function mapStateToProps(state, ownProps) {
	return {
		totalRows: state.sheet.totalRows,
		totalColumns: state.sheet.totalColumns,
		cellKeys: state.cellKeys,
		classes: ownProps.classes,
	};
}

export default connect(mapStateToProps)(RowAdder);
