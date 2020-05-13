import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { DragSource } from 'react-dnd';
import { ItemTypes } from '../../constants';
import {
   indexToRowNumber,
   extractRowColFromCellKey,
   isSomething,
   isNothing,
} from '../../helpers';
import { toggledShowFilterModal, rowMoved } from '../../actions';
import IconFilter from '../atoms/IconFilter';

const dragSourceSpec = {
   beginDrag: (props, monitor, component) => {
      const { row } = extractRowColFromCellKey(props.cellKey);
      return { rowIndex: row };
   },
   endDrag: (props, monitor, component) => {
      const { row } = extractRowColFromCellKey(props.cellKey);
      rowMoved(row);
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

class RowHeaderDetail extends Component {
   constructor(props) {
      super(props);
      this.showFilterModalForRow = this.showFilterModalForRow.bind(this);
      this.isFilterEngaged = this.isFilterEngaged.bind(this);
   }

   showFilterModalForRow = rowIndex =>
      this.props.toggledShowFilterModal(rowIndex, null);

   isFilterEngaged = (rowIndex, rowFilters) => {
      if (isNothing(rowFilters)) {
         return false;
      }
      return R.pipe(
         R.find(
            R.pipe(
               R.prop('index'),
               R.equals(rowIndex)
            )
         ),
         R.prop('filterExpression'),
         isSomething
      )(rowFilters);
   };

   render() {
      const { row } = extractRowColFromCellKey(this.props.cellKey);
      const rowNum = indexToRowNumber(row);

      // These props are injected by React DnD, as defined by your `collect` function above:
      const { connectDragSource } = this.props;

      return connectDragSource(
         <div className="flex w-full h-full cursor-row-resize">
            <div
               key={'rowNum_' + row}
               className="w-2/4 text-center self-center text-grey-blue"
            >
               {rowNum}
            </div>
            <IconFilter
               key={'iconFilter_' + row}
               classes={'w-2/4 text-center'}
               height="100%"
               width="100%"
               fitlerEngaged={this.isFilterEngaged(row, this.props.rowFilters)}
               onClickFn={() => this.showFilterModalForRow(row)}
               testId={'row' + rowNum}
            />
         </div>
      );
   }
}

function mapStateToProps(state, ownProps) {
   return {
      showFilterModal: state.showFilterModal,
      cellKey: ownProps.cellKey,
      totalRows: state.sheet.totalRows,
      rowFilters: state.sheet.rowFilters,
      sheet: state.sheet,
   };
}

const DragableRowHeader = DragSource(
   ItemTypes.DRAGGABLE_ROW_HEADER,
   dragSourceSpec,
   dragCollect
)(RowHeaderDetail);
export default connect(
   mapStateToProps,
   { toggledShowFilterModal }
)(DragableRowHeader);
