import React, { Component } from 'react';
import { connect } from 'react-redux';
import { DragSource } from 'react-dnd';
import { ItemTypes } from '../../constants';
import { indexToColumnLetter, isSomething, arrayContainsSomething, getObjectFromArrayByKeyValue } from '../../helpers';
import { stateColumnFilters, stateShowFilterModal } from '../../helpers/dataStructureHelpers';
import { toggledShowFilterModal, columnMoved } from '../../actions';
import { startedUndoableAction, completedUndoableAction } from '../../actions/undoActions';
import { updatedFrozenColumns } from '../../actions/metadataActions';
import IconFilter from '../atoms/IconFilter';
import SnowflakeIcon from '../atoms/IconSnowflake';

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
      this.toggleFreeze = this.toggleFreeze.bind(this);
   }

   showFilterModalForColumn = () => this.props.toggledShowFilterModal(null, this.props.index);

   isFilterEngaged = (columnFilters, columnIndex) => {
      if (arrayContainsSomething(columnFilters)) {
         const filterAtColumnIndex = getObjectFromArrayByKeyValue('index', columnIndex, columnFilters);
         return isSomething(filterAtColumnIndex) && isSomething(filterAtColumnIndex.filterExpression);
      }
      return false;
   };

   toggleFreeze = () => {
      console.log('ColumnHeaderDetail.toggleFreeze about to call startedUndoableAction');
      startedUndoableAction();
      updatedFrozenColumns([{ index: this.props.index, isFrozen: !this.props.frozen }]);
      completedUndoableAction('toggled freeze for column ' + this.props.index);
   }

   render() {
      const columnLetter = indexToColumnLetter(this.props.index);

      // These props are injected by React DnD, as defined by your `collect` function above:
      const { connectDragSource } = this.props;

      return connectDragSource(
         <div className="flex w-full h-full cursor-col-resize">
            <div className="w-3/4 text-center self-center text-grey-blue">{columnLetter}</div>
            <SnowflakeIcon
               classes="pt-1 pl-1 pb-1 w-1/4"
               switchedOn={this.props.frozen}
               onClickFn={this.toggleFreeze}
            />
            <IconFilter
               classes="pt-1 w-1/4"
               height="65%"
               width="100%"
               fitlerEngaged={this.isFilterEngaged(this.props.columnFilters, this.props.index)}
               onClickFn={this.showFilterModalForColumn}
               testId={'col' + this.props.index}
            />
         </div>
      );
   }
}

function mapStateToProps(state, ownProps) {
   return {
      showFilterModal: stateShowFilterModal(state),
      index: ownProps.index,
      columnFilters: stateColumnFilters(state),
      frozen: ownProps.frozen
   };
}

const DragableColumnHeader = DragSource(
   ItemTypes.DRAGGABLE_COLUMN_HEADER,
   dragSourceSpec,
   dragCollect
)(ColumnHeaderDetail);
export default connect(mapStateToProps, { toggledShowFilterModal })(DragableColumnHeader);
