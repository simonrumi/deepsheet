import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
   updateEditor,
   updatedCellBeingEdited,
   updatedSheetId,
} from '../actions';
import {
   indexToColumnLetter,
   indexToRowNumber,
   extractRowColFromString,
   fetchSummaryCellFromSheet,
   loadSheet,
} from '../helpers';
import managedStore from '../store';

class Cell extends Component {
   constructor(props) {
      super(props);
      this._row = null;
      this._col = null;
      this._isLastRow = null;
      this._isLastColumn = null;
   }

   componentWillMount() {
      const nums = extractRowColFromString(this.props.cellKey);
      this._row = nums.row;
      this._col = nums.col;
      this._isLastRow = this.props.sheet.totalRows - 1 === this._row;
      this._isLastColumn = this.props.sheet.totalColumns - 1 === this._col;
      this._cellContent = this.props.managedStore.state[this.props.cellKey];
   }

   render() {
      return (
         <div className={this.createClassNames()}>
            {this.createCellContent()}
         </div>
      );
   }

   createClassNames() {
      // the class names come from grid.css. Perhaps this string should be put into a const somewhere
      let classes = 'grid-item dark-dark-blue text top left';
      if (this._isLastColumn) {
         classes += ' right';
      }
      if (this._isLastRow) {
         classes += ' bottom';
      }
      classes += ' border';
      return classes;
   }

   createCellContent() {
      const columnName = indexToColumnLetter(this._col);
      const rowName = indexToRowNumber(this._row);
      if (this.props.cell instanceof Object && this.props.cell._id) {
         return this.renderSubSheetCell(this.props.cell._id);
      }
      const cellId = columnName + rowName; // e.g. "B2"
      return (
         <div onClick={event => this.onCellClick(event)} id={cellId}>
            {this.props.cell}
         </div>
      );
   }

   onCellClick(event) {
      const cellData = {
         row: this._row,
         column: this._col,
         content: event.target.innerHTML,
      };
      this.props.updateEditor(cellData);
      this.props.editorRef.focus();
   }

   renderSubSheetCell(sheetId) {
      const summaryCell = fetchSummaryCellFromSheet(sheetId);
      return (
         <div className="pointer" onClick={() => loadSheet(sheetId)}>
            {summaryCell}
         </div>
      );
   }
}

function mapStateToProps(state, ownProps) {
   const cell = managedStore.state[ownProps.cellKey];
   return {
      sheet: state.sheet,
      editorRef: state.editorRef,
      cellKey: ownProps.cellKey,
      cell,
      managedStore,
   };
}

export default connect(
   mapStateToProps,
   { updateEditor, updatedCellBeingEdited, updatedSheetId }
)(Cell);
