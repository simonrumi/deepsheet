import * as R from 'ramda';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Header from './Header';
import Editor from './Editor';
import ColumnHeaders from './organisms/ColumnHeaders';
import RowHeader from './molecules/RowHeader';
import Cell from './molecules/Cell';
import FilterModal from './organisms/FilterModal';
import { fetchedSheet, updatedSheetId } from '../actions';
import managedStore from '../store';
import { shouldShowRow, nothing, isFirstColumn } from '../helpers/sheetHelpers';
// import * as RWrap from '../helpers/ramdaWrappers'; // use this for debugging only

class Sheet extends Component {
	componentDidMount() {
		this.props.updatedSheetId(this.props.sheetId);
	}

	renderRowHeader = cellKey => <RowHeader cellKey={cellKey} key={'row_header_' + cellKey} />;

	renderCell = cellKey => <Cell cellKey={cellKey} key={cellKey} />;

	maybeRowHeader = R.ifElse(isFirstColumn, this.renderRowHeader, nothing);

	renderRow = cellKey => [this.maybeRowHeader(cellKey), this.renderCell(cellKey)];

	maybeRow = sheet => R.ifElse(shouldShowRow(sheet), this.renderRow, nothing);

	renderCells() {
		if (
			R.has('totalRows', this.props.sheet) &&
			this.props.cellKeys &&
			this.props.cellKeys.length > 0 &&
			this.props.sheetId === this.props.sheet._id
		) {
			// note that this is the only place where we are passing data from this.props into a function
			// this is because we have first checked that the props exist.
			// after this call, all the subsequent functions are not made with actual data in them.
			return R.map(this.maybeRow(this.props.sheet), this.props.cellKeys);
		}
		return <div>loading...</div>;
	}

	renderGridColHeaderStyle(colNum) {
		const colSpan = 'span ' + (colNum + 1); //need an extra column for the row headers on the left
		return {
			gridColumn: colSpan,
			gridRow: 'span 1',
			width: '100%',
			height: '100%',
			padding: 0,
		};
	}

	renderGridSizingStyle(numRows, numCols) {
		const headerRowHeight = '2em';
		const headerColHeight = '2em';
		const rowsStyle = headerRowHeight + ' repeat(' + numRows + ', 1fr)';
		const columnsStyle = headerColHeight + ' repeat(' + numCols + ', 1fr)';
		return {
			gridTemplateRows: rowsStyle,
			gridTemplateColumns: columnsStyle,
		};
	}

	render() {
		return (
			<div className="px-1">
				<Header />
				<Editor />
				<FilterModal />
				<div
					className="grid-container"
					style={this.renderGridSizingStyle(this.props.sheet.totalRows, this.props.sheet.totalColumns)}
				>
					<div className="grid-item" style={this.renderGridColHeaderStyle(this.props.sheet.totalColumns)}>
						<ColumnHeaders />
					</div>
					{this.renderCells()}
				</div>
				<div className="clear" />
			</div>
		);
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
	}
)(Sheet);
