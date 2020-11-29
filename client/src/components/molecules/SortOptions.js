import React, { Component } from 'react';
import { connect } from 'react-redux';
import Button from '../atoms/Button';
import Label from '../atoms/Label';
import { SORT_INCREASING, SORT_DECREASING, ROW_AXIS, COLUMN_AXIS } from '../../constants';
import {
   updatedSortOptions,
   sortedAxis,
} from '../../actions';
import { toggledShowFilterModal } from '../../actions/filterActions';
import { startedUndoableAction, completedUndoableAction } from '../../actions/undoActions';

class SortOptions extends Component {
   onClickAtoZ = () => {
      this.props.updatedSortOptions({
         rowSortByIndex: this.props.rowIndex,
         columnSortByIndex: this.props.colIndex,
         sortDirection: SORT_INCREASING,
      });
      startedUndoableAction();
      this.props.sortedAxis();
      const axisName = this.props.rowIndex ? ROW_AXIS : COLUMN_AXIS
      completedUndoableAction('sorted A to Z for ' + axisName + ' ' + this.props.rowIndex || this.props.columnIndex);
      this.props.toggledShowFilterModal();
   };

   onClickZtoA = () => {
      this.props.updatedSortOptions({
         rowSortByIndex: this.props.rowIndex,
         columnSortByIndex: this.props.colIndex,
         sortDirection: SORT_DECREASING,
      });
      startedUndoableAction();
      this.props.sortedAxis();
      const axisName = this.props.rowIndex ? ROW_AXIS : COLUMN_AXIS
      completedUndoableAction('sorted Z to A for ' + axisName + ' ' + this.props.rowIndex || this.props.columnIndex);
      this.props.toggledShowFilterModal();
   };

   renderAtoZ = () => {
      return (
         <Button
            buttonType="button"
            classes="pr-2"
            onClickFn={this.onClickAtoZ}
            label="A to Z"
         />
      );
   };

   renderZtoA = () => {
      return (
         <Button
            buttonType="button"
            classes="pl-2"
            onClickFn={this.onClickZtoA}
            label="Z to A"
         />
      );
   };

   render() {
      const allClasses =
         'border border-solid border-grey-blue flex items-center justify-between px-2 py-2 ' +
         this.props.classes;
      return (
         <div className={allClasses}>
            <Label label="Sort" />
            <div className="flex items-center justify-around px-2 py-2">
               {this.renderAtoZ()}
               {this.renderZtoA()}
            </div>
         </div>
      );
   }
}

const mapStateToProps = (state, ownProps) => {
   return {
      classes: ownProps.classes || '',
      rowIndex: ownProps.rowIndex,
      colIndex: ownProps.colIndex,
   };
};

export default connect(
   mapStateToProps,
   { updatedSortOptions, sortedAxis, toggledShowFilterModal }
)(SortOptions);
