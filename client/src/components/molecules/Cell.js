import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { updatedEditor } from '../../actions';
import {
   extractRowColFromCellKey,
   nothing,
   isSomething,
   isNothing,
} from '../../helpers';
import { createClassNames, createCellId } from '../../helpers/cellHelpers';
import managedStore from '../../store';
import SubsheetCell from './SubsheetCell';

class Cell extends Component {
   constructor(props) {
      super(props);
      this.renderCell = this.renderCell.bind(this);
      this.renderRegularCell = this.renderRegularCell.bind(this);
      this.renderSubsheetCell = this.renderSubsheetCell.bind(this);
      this.renderBlankCell = this.renderBlankCell.bind(this);
   }

   onCellClick(event, cellKey, editorRef) {
      const { row, column } = extractRowColFromCellKey(cellKey);
      const cellData = {
         row,
         column,
         content: { text: event.target.innerHTML },
      };
      this.props.updatedEditor(cellData);

      // need this setTimeout to ensure the code runs on the next tick,
      // otherwise the EditorInput is disabled when given the focus
      // bit of a hack but seemed to be an accepted workaround.
      window.setTimeout(() => {
         if (editorRef.current) {
            editorRef.current.focus();
         }
      }, 0);
   }

   renderRegularCell(cell) {
      return (
         <div
            className={createClassNames(this.props.classes)}
            onClick={event =>
               this.onCellClick(event, this.props.cellKey, this.props.editorRef)
            }
            id={createCellId(cell.column, cell.row)}
         >
            {cell.content.text}
         </div>
      );
   }

   renderBlankCell = cell => (
      <div className={createClassNames(this.props.classes)} />
   );

   renderSubsheetCell = cell => <SubsheetCell cell={cell} />;

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
      [
         R.pipe(
            R.path(['content', 'subsheetId']),
            isSomething
         ),
         this.renderSubsheetCell,
      ],
      [
         R.pipe(
            R.path(['content', 'subsheetId']),
            isNothing
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
