import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { DragSource } from 'react-dnd';
import managedStore from '../../store';
import { ItemTypes } from '../../constants';
import { indexToRowNumber, isSomething, isNothing } from '../../helpers';
import { cellRow, stateRowFilters, stateShowFilterModal } from '../../helpers/dataStructureHelpers';
import { toggledShowFilterModal, rowMoved } from '../../actions';
import { startedUndoableAction, completedUndoableAction } from '../../actions/undoActions';
import { updatedFrozenRows } from '../../actions/metadataActions';
import IconFilter from '../atoms/IconFilter';
import SnowflakeIcon from '../atoms/IconSnowflake';

const dragSourceSpec = {
   beginDrag: (props, monitor, component) => {
      const row = cellRow(props.cell);
      return { rowIndex: row };
   },
   endDrag: (props, monitor, component) => {
      const row = cellRow(props.cell)
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
      this.toggleFreeze = this.toggleFreeze.bind(this);
   }

   showFilterModalForRow = rowIndex => this.props.toggledShowFilterModal(rowIndex, null);

   isFilterEngaged = (rowIndex, rowFilters) => {
      if (isNothing(rowFilters)) {
         return false;
      }
      return R.pipe(
         R.find(R.pipe(R.prop('index'), R.equals(rowIndex))),
         R.prop('filterExpression'),
         isSomething
      )(rowFilters);
   };

   toggleFreeze = () => {
      startedUndoableAction();
      updatedFrozenRows([{ index: this.props.cell.row, isFrozen: !this.props.frozen }]);
      completedUndoableAction('toggled freeze for row ' + this.props.index);
   }

   render() {
      const row = cellRow(this.props.cell);
      const rowNum = indexToRowNumber(row);

      // These props are injected by React DnD, as defined by your `collect` function above:
      const { connectDragSource } = this.props;

      return connectDragSource(
         <div className="flex flex-col w-full h-full justify-evenly">
            <SnowflakeIcon
               classes="w-1/2 mt-1 ml-4"
               switchedOn={this.props.frozen}
               onClickFn={this.toggleFreeze}
            />
            <div className="flex cursor-row-resize">
               <div key={'rowNum_' + row} className="w-2/4 text-center self-center text-grey-blue">
                  {rowNum}
               </div>
               <IconFilter
                  key={'iconFilter_' + row}
                  classes={'w-2/4 text-center'}
                  height="100%"
                  width="100%"
                  fitlerEngaged={this.isFilterEngaged(row, stateRowFilters(managedStore.state))}
                  onClickFn={() => this.showFilterModalForRow(row)}
                  testId={'row' + rowNum}
               />
            </div>
         </div>
      );
   }
}

function mapStateToProps(state, ownProps) {
   return {
      showFilterModal: stateShowFilterModal(state),
      cell: ownProps.cell,
      frozen: ownProps.frozen
   };
}

const DragableRowHeader = DragSource(ItemTypes.DRAGGABLE_ROW_HEADER, dragSourceSpec, dragCollect)(RowHeaderDetail);
export default connect(mapStateToProps, { toggledShowFilterModal })(DragableRowHeader);
