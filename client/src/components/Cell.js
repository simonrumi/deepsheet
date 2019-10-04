import React, { Component } from 'react';
import { connect } from 'react-redux';
import { updateEditor } from '../actions';
import { indexToColumnLetter, indexToRowNumber } from '../helpers';
import { CELL_ } from '../actions/types';

class Cell extends Component {
   render() {
      // top level div used to have this: contentEditable="true"
      return (
         <div className={this.createClassNames()}>
            {this.createCellContent()}
         </div>
      ); /*dark-dark-blue text*/
   }

   createClassNames() {
      // the class names come from grid.css. Perhaps this string should be put into a const somewhere
      let classes = 'grid-item dark-dark-blue text top left';
      if (this.props.isLastColumn) {
         classes += ' right';
      }
      if (this.props.isLastRow) {
         classes += ' bottom';
      }
      classes += ' border';
      return classes;
   }

   createCellContent() {
      const columnName = indexToColumnLetter(this.props.column);
      const rowName = indexToRowNumber(this.props.row);
      return (
         <div
            onClick={event => this.onCellClick(event)}
            id={`${columnName}${rowName}`}
         >
            {this.props.cell}
         </div>
      );
   }

   onCellClick(event) {
      const cellData = {
         row: this.props.row,
         column: this.props.column,
         content: event.target.innerHTML,
      };
      this.props.updateEditor(cellData);
      this.props.editorRef.focus();
   }
}

function mapStateToProps(state, ownProps) {
   const cellState = CELL_ + ownProps.row + '_' + ownProps.column;
   return {
      sheet: state.sheet,
      row: ownProps.row,
      column: ownProps.column,
      editorRef: state.editorRef,
      isLastColumn: ownProps.isLastColumn,
      isLastRow: ownProps.isLastRow,
      cell: state[cellState],
   };
}

export default connect(
   mapStateToProps,
   { updateEditor }
)(Cell);
