import React, { Component } from 'react';
import * as R from 'ramda';
import managedStore from '../../store';
import { connect } from 'react-redux';
import { updatedTotalRows, updatedCellKeys, updatedCell } from '../../actions';
import { createCellKey } from '../../helpers/cellHelpers';
import { cellReducerFactory } from '../../reducers/cellReducers';
import { COLUMN_AXIS } from '../../helpers';
import { shouldShowColumn, getAxisVisibilityName } from '../../helpers/visibilityHelpers';
import IconAdd from '../atoms/IconAdd';

class RowAdder extends Component {
	constructor(props) {
		super(props);
		this.addRowOfBlankCells = this.addRowOfBlankCells.bind(this);
		this.insertNewRow = this.insertNewRow.bind(this);
		this.createUpdatesForNewCells = this.createUpdatesForNewCells.bind(this);
		this.addNewCellsToStore = this.addNewCellsToStore.bind(this);
		this.addOneCell = this.addOneCell.bind(this);
		this.addOneCellReducer = this.addOneCellReducer.bind(this);
		this.addManyCellReducersToStore = this.addManyCellReducersToStore.bind(this);
		this.makeNewCell = this.makeNewCell.bind(this);
		this.getVisibilityForColumn = this.getVisibilityForColumn.bind(this);
	}

	getVisibilityForColumn = columnIndex => {
		console.log(
			'getVisibilityForColumn, columnIndex',
			columnIndex,
			'visibility obj',
			R.prop('columnVisibility', this.props.sheet)
		);
		const tempReturnObj = R.pipe(
			getAxisVisibilityName,
			R.prop(R.__, this.props.sheet), // gets the column visibility object
			shouldShowColumn(R.__, columnIndex)
		)(COLUMN_AXIS);
		console.log('about to return', tempReturnObj);
		return tempReturnObj; // TODO get rid of this and all console logging
	};

	makeNewCell = (rowIndex, columnIndex) => {
		console.log('makeNewCell, rowIndex', rowIndex, 'columnIndex', columnIndex);
		return {
			row: rowIndex,
			column: columnIndex,
			content: '',
			visible: this.getVisibilityForColumn(columnIndex),
		};
	};

	addManyCellReducersToStore = cellReducers => {
		const combineNewReducers = managedStore.store.reducerManager.addMany(cellReducers);
		managedStore.store.replaceReducer(combineNewReducers);
	};

	// returns copy of cellReducers with and added cellReducer
	addOneCellReducer = (cellKey, row, column, cellReducers = {}) =>
		R.pipe(
			cellReducerFactory,
			R.assoc(cellKey, R.__, cellReducers)
		)(row, column);

	addOneCell = (rowIndex, columnIndex, updates) => {
		console.log('addOneCell, rowIndex', rowIndex, 'columnIndex', columnIndex, 'updates', updates);
		const cellKey = createCellKey(rowIndex, columnIndex);
		console.log('addOneCell, about to append cellKey', cellKey);
		const cellKeys = R.append(cellKey, updates.cellKeys);
		console.log('addOneCell, about to addOneCellReducer');
		const cellReducers = this.addOneCellReducer(cellKey, rowIndex, columnIndex, updates.cellReducers);
		console.log('addOneCell, about to makeNewCell');
		const cell = this.makeNewCell(rowIndex, columnIndex);
		console.log('addOneCell, about to append cell', cell);
		const cells = R.append(cell, updates.cells);
		return { cellReducers, cellKeys, cells };
	};

	addNewCellsToStore = cells => {
		console.log('addNewCellsToStore, got cells', cells);
		R.map(cell => updatedCell(cell), cells);
	};

	createUpdatesForNewCells = (
		updates, //contains { cellReducers, cellKeys, cells }
		rowIndex,
		columnIndex = 0
	) => {
		console.log(
			'createUpdatesForNewCells: this.props.totalColumns',
			this.props.totalColumns,
			'columnIndex',
			columnIndex
		);
		if (this.props.totalColumns === columnIndex) {
			return updates;
		}
		console.log('recursively calling createUpdatesForNewCells with columnIndex', columnIndex + 1);
		return this.createUpdatesForNewCells(
			this.addOneCell(rowIndex, columnIndex, updates),
			rowIndex,
			columnIndex + 1
		);
	};

	addRowOfBlankCells = () => {
		const updates = this.createUpdatesForNewCells(
			{ cellKeys: this.props.cellKeys, cellReducers: {}, cells: [] },
			this.props.totalRows
		); // totalRows, being the count of existing rows, will give us the index of the next row
		console.log('addRowOfBlankCells, got updates', updates);
		updatedCellKeys(updates.cellKeys);
		this.addManyCellReducersToStore(updates.cellReducers);
		this.addNewCellsToStore(updates.cells);
		// TODO
		// createUpdatesForNewCells causes call to getColumnVisibility which returns the correct visibility info...
		// BUT this happens *after* the sheet is updated
		// that is very odd since addNewCellsToStore causes updatedCell to be called which should update the cell in the store

		///check logs again....still may have above issue, but getting right data into store
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
		sheet: state.sheet,
		totalRows: state.sheet.totalRows,
		totalColumns: state.sheet.totalColumns,
		cellKeys: state.cellKeys,
		classes: ownProps.classes,
	};
}

export default connect(mapStateToProps)(RowAdder);
