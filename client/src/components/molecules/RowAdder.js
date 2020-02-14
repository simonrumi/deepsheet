import React, { Component } from 'react';
import { connect } from 'react-redux';
import insertNewRow from '../../services/insertNewRow';
import IconAdd from '../atoms/IconAdd';

class RowAdder extends Component {
	/*
	constructor(props) {
		super(props);
		this.insertNewRow = this.insertNewRow.bind(this);
		this.createUpdatesForNewCells = this.createUpdatesForNewCells.bind(this);
		this.addNewCellsToStore = this.addNewCellsToStore.bind(this);
		this.addOneCell = this.addOneCell.bind(this);
		this.addOneCellReducer = this.addOneCellReducer.bind(this);
		this.addManyCellReducersToStore = this.addManyCellReducersToStore.bind(this);
		this.makeNewCell = this.makeNewCell.bind(this);
		this.getVisibilityForColumn = this.getVisibilityForColumn.bind(this);
	}

	getVisibilityForColumn = columnIndex =>
		R.pipe(
			getAxisVisibilityName,
			R.prop(R.__, this.props.sheet), // gets the column visibility object
			shouldShowColumn(R.__, columnIndex)
		)(COLUMN_AXIS);

	makeNewCell = (rowIndex, columnIndex) => {
		return {
			row: rowIndex,
			column: columnIndex,
			content: '',
			visible: this.getVisibilityForColumn(columnIndex),
		};
	};

	maybeAddRowVisibilityEntry = (rowIndex, rowVisibilityObj) =>
		R.when(
			R.both(
				// rowVisibilityObj is not empty and...
				R.pipe(
					R.isEmpty,
					R.not
				),
				// rowVisibilityObj doesn't have an entry for the row we're adding
				R.pipe(
					R.has(rowIndex),
					R.not
				)
			),
			R.pipe(
				R.thunkify(R.assoc)(rowIndex, true, {}), // make an object like {3: true} (where 3 is the value of totalRows)
				updatedRowVisibility // add that object into the rowVisibility object
			)
		)(rowVisibilityObj);

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
		const cellKey = createCellKey(rowIndex, columnIndex);
		const cellKeys = R.append(cellKey, updates.cellKeys);
		const cellReducers = this.addOneCellReducer(cellKey, rowIndex, columnIndex, updates.cellReducers);
		const cell = this.makeNewCell(rowIndex, columnIndex);
		const cells = R.append(cell, updates.cells);
		return { cellReducers, cellKeys, cells };
	};

	addNewCellsToStore = cells => R.map(cell => updatedCell(cell), cells);

	createUpdatesForNewCells = (
		updates, //contains { cellReducers, cellKeys, cells }
		rowIndex,
		columnIndex = 0
	) => {
		if (this.props.totalColumns === columnIndex) {
			return updates;
		}
		return this.createUpdatesForNewCells(
			this.addOneCell(rowIndex, columnIndex, updates),
			rowIndex,
			columnIndex + 1
		);
	};

	insertNewRow = () => {
		const updates = this.createUpdatesForNewCells(
			{ cellKeys: this.props.cellKeys, cellReducers: {}, cells: [] },
			this.props.totalRows
		); // totalRows, being the count of existing rows, will give us the index of the next row
		updatedCellKeys(updates.cellKeys);
		this.addManyCellReducersToStore(updates.cellReducers);
		this.maybeAddRowVisibilityEntry(this.props.totalRows, this.props.sheet.rowVisibility);
		this.addNewCellsToStore(updates.cells);
		updatedTotalRows(this.props.totalRows + 1);
	}; */

	render() {
		return (
			<div className={this.props.classes} data-testid="rowAdder">
				<div className="flex items-center px-2 py-2">
					<IconAdd
						classes={'flex-1 h-3 w-3'}
						onClickFn={() =>
							insertNewRow(
								this.props.cellKeys,
								this.props.totalRows,
								this.props.totalColumns,
								this.props.sheet.rowVisibility,
								this.props.sheet.columnVisibility
							)
						}
					/>
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
