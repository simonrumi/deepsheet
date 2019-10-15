import { map, reduce, concat } from 'ramda';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Header from './Header';
import Editor from './Editor';
import Cell from './Cell';
import { fetchSheet } from '../helpers';
import { fetchedSheet, updatedSheetId, populateCellsInStore, updatedCellKeys } from '../actions';
import { createCellReducers } from '../reducers/cellReducers';
import managedStore from '../store';

class Sheet extends Component {
	async componentDidMount() {
		this.initializeSheet(this.props.sheetId);
	}

	async initializeSheet(sheetId) {
		const sheet = await fetchSheet(sheetId);
		this.props.fetchedSheet(sheet);
		this.initializeCells(sheet);
	}

	initializeCells(sheet) {
		if (this.props.managedStore.store && sheet.metadata) {
			createCellReducers(sheet.metadata);
			populateCellsInStore(sheet);
			this.props.updatedCellKeys(this.createCellKeys(sheet.rows));
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
					{this.renderCells()}
				</div>
				<div className="clear" />
			</div>
		);
	}

	renderCells() {
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
		sheet: state.sheet,
		managedStore,
		cellKeys: state.cellKeys,
		sheetId: state.sheetId,
	};
}

export default connect(
	mapStateToProps,
	{
		fetchedSheet,
		updatedSheetId,
		populateCellsInStore,
		updatedCellKeys,
	}
)(Sheet);
