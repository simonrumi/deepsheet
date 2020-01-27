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
import { shouldShowRow, isFirstColumn, isLastColumn, getRequiredNumItemsForAxis } from '../helpers/visibilityHelpers';
// import * as RWrap from '../helpers/ramdaWrappers'; // use this for debugging only

// *** TODO: in this order
// add additional columns
// add additional rows
// move columns
// move rows
// sort columns
// sort rows

class Sheet extends Component {
	componentDidMount() {
		this.props.updatedSheetId(this.props.sheetId);
	}

	renderEmptyEndCell = cellKey => {
		console.log('renderEmptyEndCell for cellKey', cellKey);
		return <Cell blankCell={true} cellKey={cellKey} key={cellKey + '_endCell'} />;
	};

	maybeEmptyEndCell = cellKey => {
		console.log(
			'maybeEmptyEndCell, isLastColumn(this.props.sheet.totalColumns)',
			isLastColumn(this.props.sheet.totalColumns, cellKey)
		);
		return R.ifElse(isLastColumn(this.props.sheet.totalColumns), this.renderEmptyEndCell, nothing)(cellKey);
	};

	renderRowHeader = cellKey => <RowHeader cellKey={cellKey} key={'row_header_' + cellKey} />;

	renderCell = cellKey => <Cell cellKey={cellKey} key={cellKey} />;

	maybeRowHeader = R.ifElse(isFirstColumn, this.renderRowHeader, nothing);

	renderRow = cellKey => [this.maybeRowHeader(cellKey), this.renderCell(cellKey), this.maybeEmptyEndCell(cellKey)];

	maybeRow = sheet => R.ifElse(shouldShowRow(sheet), this.renderRow, nothing);

	renderCells() {
		if (
			R.has('totalRows', this.props.sheet) &&
			this.props.cellKeys &&
			this.props.cellKeys.length > 0 &&
			this.props.sheetId === this.props.sheet._id
		) {
			return R.map(this.maybeRow(this.props.sheet), this.props.cellKeys);
		}
		return <div>loading...</div>;
	}

	columnHeaderStyle = colSpan => {
		return {
			gridColumn: colSpan,
			gridRow: 'span 1',
			width: '100%',
			height: '100%',
			padding: 0,
		};
	};

	createColSpan = colNum => 'span ' + (colNum + 1); //need an extra column for the row headers on the left

	getGridSizingStyle([numRows, numCols]) {
		const headerRowHeight = '2em';
		const headerColHeight = '2em';
		const rowsStyle = headerRowHeight + ' repeat(' + (numRows + 1) + ', 1fr)';
		const columnsStyle = headerColHeight + ' repeat(' + (numCols + 1) + ', 1fr)';
		return {
			gridTemplateRows: rowsStyle,
			gridTemplateColumns: columnsStyle,
		};
	}

	renderColHeaderStyle = R.pipe(
		getRequiredNumItemsForAxis,
		this.createColSpan,
		this.columnHeaderStyle
	);

	renderGridSizingStyle = sheet =>
		this.getGridSizingStyle(R.map(getRequiredNumItemsForAxis(R.__, sheet), [ROW_AXIS, COLUMN_AXIS]));

	maybeRenderFilterModal = showFilterModal => (showFilterModal ? <FilterModal /> : null);

	render() {
		return (
			<div className="px-1">
				<Header />
				<Editor />
				{this.maybeRenderFilterModal(this.props.showFilterModal)}
				<div className="grid-container" style={this.renderGridSizingStyle(this.props.sheet)}>
					<div className="grid-item" style={this.renderColHeaderStyle(COLUMN_AXIS, this.props.sheet)}>
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
		showFilterModal: state.filterModal.showFilterModal,
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
