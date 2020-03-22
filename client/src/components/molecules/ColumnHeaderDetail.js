import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { DragSource } from 'react-dnd';
import { ItemTypes } from '../../constants';
import { indexToColumnLetter } from '../../helpers';
import { toggledShowFilterModal, columnMoved } from '../../actions';
import IconFilter from '../atoms/IconFilter';

const dragSourceSpec = {
   beginDrag: (props, monitor, component) => {
      return { columnIndex: props.index };
   },
   endDrag: (props, monitor, component) => {
      columnMoved(props.index);
      return { columnIndex: props.index };
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

class ColumnHeaderDetail extends Component {
   constructor(props) {
      super(props);
      this.showFilterModalForColumn = this.showFilterModalForColumn.bind(this);
      this.isFilterEngaged = this.isFilterEngaged.bind(this);
   }

   showFilterModalForColumn = () =>
      this.props.toggledShowFilterModal(null, this.props.index);

   isFilterEngaged = () => {
      if (
         R.hasPath(
            [this.props.index, 'filterExpression'],
            this.props.columnFilters
         )
      ) {
         return R.not(
            R.isEmpty(
               this.props.columnFilters[this.props.index].filterExpression
            )
         );
      }
      return false;
   };

   render() {
      const columnLetter = indexToColumnLetter(this.props.index);

      // These props are injected by React DnD, as defined by your `collect` function above:
      const { connectDragSource } = this.props;

      return connectDragSource(
         <div className="flex w-full h-full cursor-col-resize">
            <div className="w-3/4 text-center self-center text-grey-blue">
               {columnLetter}
            </div>
            <IconFilter
               classes="pt-1 w-1/4"
               height="65%"
               width="100%"
               fitlerEngaged={this.isFilterEngaged()}
               onClickFn={this.showFilterModalForColumn}
               testId={'col' + this.props.index}
            />
         </div>
      );
   }
}

function mapStateToProps(state, ownProps) {
   return {
      showFilterModal: state.showFilterModal,
      totalColumns: state.sheet.totalColumns,
      index: ownProps.index,
      columnFilters: state.sheet.columnFilters,
   };
}

const DragableColumnHeader = DragSource(
   ItemTypes.DRAGGABLE_COLUMN_HEADER,
   dragSourceSpec,
   dragCollect
)(ColumnHeaderDetail);
export default connect(
   mapStateToProps,
   { toggledShowFilterModal }
)(DragableColumnHeader);
