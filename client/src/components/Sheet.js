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
import { nothing, ROW_AXIS, COLUMN_AXIS } from '../helpers';
import { shouldShowRow, isFirstColumn, getRequiredNumItemsForAxis } from '../helpers/visibilityHelpers';
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
		console.log('renderGridSizingStyle,  numRows = ' + numRows + ', numCols = ' + numCols);
		const headerRowHeight = '2em';
		const headerColHeight = '2em';
		const rowsStyle = headerRowHeight + ' repeat(' + numRows + ', 1fr)';
		const columnsStyle = headerColHeight + ' repeat(' + numCols + ', 1fr)';
		return {
			gridTemplateRows: rowsStyle,
			gridTemplateColumns: columnsStyle,
		};
	}

	// TODO: need to calculate totalColumns - hiddenColumns and totalRows - hiddenRows

	render() {
		return (
			<div className="px-1">
				<Header />
				<Editor />
				<FilterModal />
				<div
					className="grid-container"
					style={this.renderGridSizingStyle(
						getRequiredNumItemsForAxis(ROW_AXIS, this.props.sheet),
						getRequiredNumItemsForAxis(COLUMN_AXIS, this.props.sheet)
					)}
				>
					<div
						className="grid-item"
						style={this.renderGridColHeaderStyle(getRequiredNumItemsForAxis(COLUMN_AXIS, this.props.sheet))}
					>
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
