import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { DragSource } from 'react-dnd';
import { ItemTypes } from '../../constants';
import { indexToRowNumber, extractRowColFromCellKey } from '../../helpers';
import { toggledShowFilterModal } from '../../actions';
import IconFilter from '../atoms/IconFilter';

class RowHeaderDetail extends Component {
	constructor(props) {
		super(props);
		this.showFilterModalForRow = this.showFilterModalForRow.bind(this);
		this.isFilterEngaged = this.isFilterEngaged.bind(this);
	}

	showFilterModalForRow = rowIndex => this.props.toggledShowFilterModal(rowIndex, null);

	isFilterEngaged = rowIndex => {
		if (R.hasPath([rowIndex, 'filterExpression'], this.props.rowFilters)) {
			return R.not(R.isEmpty(this.props.rowFilters[rowIndex].filterExpression));
		}
		return false;
	};

	render() {
		const { row } = extractRowColFromCellKey(this.props.cellKey);
		const rowNum = indexToRowNumber(row);

		// These props are injected by React DnD, as defined by your `collect` function above:
		const { connectDragSource } = this.props;

		return connectDragSource(
			<div className="flex w-full h-full cursor-row-resize">
				<div key={'rowNum_' + row} className="w-2/4 text-center self-center text-grey-blue">
					{rowNum}
				</div>
				<IconFilter
					key={'iconFilter_' + row}
					classes={'w-2/4 text-center'}
					fitlerEngaged={this.isFilterEngaged(row)}
					onClickFn={() => this.showFilterModalForRow(row)}
					testId={'row' + rowNum}
				/>
			</div>
		);
	}
}

const dragSourceSpec = {
	beginDrag: (props, monitor, component) => {
		const { row } = extractRowColFromCellKey(props.cellKey);
		return { rowIndex: row };
	},
	endDrag: (props, monitor, component) => {
		console.log('dragSourceSpec.endDrag props=', props, 'monitor=', monitor, 'component=', component);
		const { row } = extractRowColFromCellKey(props.cellKey);
		return { rowIndex: row };
	},
};

const dragCollect = (connect, monitor) => {
	return {
		// Call this function inside render() to let React DnD handle the drag events:
		connectDragSource: connect.dragSource(),
		// You can ask the monitor about the current drag state:
		isDragging: monitor.isDragging(),
	};
};

function mapStateToProps(state, ownProps) {
	return {
		showFilterModal: state.showFilterModal,
		cellKey: ownProps.cellKey,
		totalRows: state.sheet.totalRows,
		rowFilters: state.sheet.rowFilters,
	};
}

const DragableRowHeader = DragSource(ItemTypes.DRAGGABLE_ROW_HEADER, dragSourceSpec, dragCollect)(RowHeaderDetail);
export default connect(
	mapStateToProps,
	{ toggledShowFilterModal }
)(DragableRowHeader);
