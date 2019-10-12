import { map, reduce, concat } from 'ramda';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Header from './Header';
import Editor from './Editor';
import Cell from './Cell';
import { fetchSheet } from '../helpers';
import { fetchedSheet, populateCellsInStore, updatedCellKeys } from '../actions';
import { createCellReducers } from '../reducers/cellReducers';
import managedStore from '../store';

class App extends Component {
	constructor(props) {
		super(props);
		this._sheet = {};
	}

	async componentDidMount() {
		//populate the store with the sheet data
		this._sheet = await fetchSheet();
		this.props.fetchedSheet(this._sheet);
		this.initializeCells();
	}

	initializeCells() {
		if (this.props.managedStore.store && this._sheet.metadata) {
			const newCombinedReducer = createCellReducers(this._sheet.metadata);
			this.props.managedStore.store.replaceReducer(newCombinedReducer);
			populateCellsInStore(this._sheet);
			this.props.updatedCellKeys(this.createCellKeys(this._sheet.rows));
			delete this._sheet; // after populating the data into the store, we don't need a duplicate copy of the data hanging around
		} else {
			console.log('WARNING: App.render.initializeCells had no data to operate on');
		}
	}

	// generates a flat array of all the key names to identify cells in the sheet
	createCellKeys(rows) {
		return reduce(
			(accumulator, row) => {
				const rowOfCells = map(cell => 'cell_' + cell.row + '_' + cell.column, row.columns);
				return concat(accumulator, rowOfCells);
			},
			[], // starting value for accumulator
			rows
		);
	}

	render() {
		return (
			<div className="ui container">
				<Header />
				<div className="editor-container">
					<Editor />
				</div>
				<div className="grid-container" style={this.renderGridSizingSyle()}>
					{this.renderRows()}
				</div>
				<div className="clear" />
			</div>
		);
	}

	renderRows() {
		if (this.props.sheet && this.props.sheet.totalRows && this.props.cellKeys && this.props.cellKeys.length > 0) {
			return map(cellKey => <Cell cellKey={cellKey} key={cellKey} />, this.props.cellKeys);
		}
		return <div>No row data yet</div>;
	}

	renderGridSizingSyle() {
		if (this.props.sheet) {
			// note we're creating eg "repeat(4, [col-start] 1fr)"  to repeat 4 times, columns that take up 1fr
			// (1 out of the free space) which makes them equal size; and where 'col-start' is just a name.
			const columnsStyle = 'repeat(' + this.props.sheet.totalColumns + ', [col-start] 1fr)';
			const rowsStyle = 'repeat(' + this.props.sheet.totalRows + ', [row-start] 1fr)';
			return {
				gridTemplateColumns: columnsStyle,
				gridTemplateRows: rowsStyle,
			};
		}
	}
}

function mapStateToProps(state) {
	return {
		//rows: state.rows,
		sheet: state.sheet,
		managedStore,
		cellKeys: state.cellKeys,
	};
}

export default connect(
	mapStateToProps,
	{
		fetchedSheet,
		populateCellsInStore,
		updatedCellKeys,
	}
)(App);
