import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { updatedEditor } from '../../actions';
import { extractRowColFromCellKey, nothing } from '../../helpers';
import { createClassNames, createCellId } from '../../helpers/cellHelpers';
import managedStore from '../../store';
import SubsheetCell from './SubsheetCell';

class Cell extends Component {
   constructor(props) {
      super(props);
      this.renderCell = this.renderCell.bind(this);
      this.renderRegularCell = this.renderRegularCell.bind(this);
      this.renderSubSheetCell = this.renderSubSheetCell.bind(this);
      this.renderBlankCell = this.renderBlankCell.bind(this);
   }

   onCellClick(event) {
      const { row, column } = extractRowColFromCellKey(this.props.cellKey);
      const cellData = {
         row,
         column,
         content: event.target.innerHTML,
      };
      this.props.updatedEditor(cellData);

      // need this setTimeout to ensure the code runs on the next tick,
      // otherwise the EditorInput is disabled when given the focus
      // bit of a hack but seemed to be an accepted workaround.
      window.setTimeout(() => {
         if (this.props.editorRef.current) {
            this.props.editorRef.current.focus();
         }
      }, 0);
   }

   renderRegularCell(cell) {
      return (
         <div
            className={createClassNames(this.props.classes)}
            onClick={event => this.onCellClick(event)}
            id={createCellId(cell.column, cell.row)}
         >
            {cell.content}
         </div>
      );
   }

   renderBlankCell = cell => (
      <div className={createClassNames(this.props.classes)} />
   );

   renderSubSheetCell = cell => <SubsheetCell cell={cell} />;

   renderCell = R.cond([
      [R.isNil, nothing],
      [
         R.pipe(
            R.prop('visible'),
            R.not
         ),
         nothing,
      ],
      [R.thunkify(R.identity)(this.props.blankCell), this.renderBlankCell],
      [R.hasPath(['content', 'subSheetId']), this.renderSubSheetCell],
      [
         R.pipe(
            R.hasPath(['content', 'subSheetId']),
            R.not
         ),
         this.renderRegularCell,
      ],
   ]);

   render = () => this.renderCell(this.props.cell);
}

function mapStateToProps(state, ownProps) {
   const cell = managedStore.state[ownProps.cellKey];
   return {
      sheet: state.sheet,
      cellKey: ownProps.cellKey,
      classes: ownProps.classes,
      editorRef: state.editorRef,
      cell,
      managedStore,
      blankCell: ownProps.blankCell,
   };
}

export default connect(
   mapStateToProps,
   { updatedEditor }
)(Cell);
