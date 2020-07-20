import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { updatedEditor } from '../../actions/editorActions';
import { highlightedCell, unhighlightedCell } from '../../actions/cellActions';
import { menuHidden } from '../../actions/menuActions';
import { extractRowColFromCellKey, nothing, isSomething, isNothing } from '../../helpers';
import { createClassNames, createCellId } from '../../helpers/cellHelpers';
import { getStateCellSubsheetId, stateCellIsHighlighted } from '../../helpers/dataStructureHelpers';
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
      this.props.highlightedCell(cellData);
      this.props.updatedEditor(cellData);
      this.props.menuHidden(); // in case the menu was showing, hide it

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
      const isHighlighted = stateCellIsHighlighted(cell.row, cell.column, this.props.state);
      return (
         <div
            className={createClassNames(this.props.classes, isHighlighted)}
            onClick={event => this.onCellClick(event, this.props.cellKey, this.props.editorRef)}
            id={createCellId(cell.column, cell.row)}>
            {cell.content.text}
         </div>
      );
   }

   renderBlankCell = cell => <div className={createClassNames(this.props.classes)} />;

   renderSubsheetCell = cell => <SubsheetCell cell={cell} />;

   renderCell = R.cond([
      [R.isNil, nothing],
      [R.pipe(R.prop('visible'), R.not), nothing],
      [R.thunkify(R.identity)(this.props.blankCell), this.renderBlankCell],
      [R.pipe(getStateCellSubsheetId(R.__, this.props.state), isSomething), this.renderSubsheetCell],
      [R.pipe(getStateCellSubsheetId(R.__, this.props.state), isNothing), this.renderRegularCell],
   ]);

   render = () => this.renderCell(this.props.cell);
}

function mapStateToProps(state, ownProps) {
   const cell = managedStore.state[ownProps.cellKey];
   return {
      state,
      sheet: state.sheet,
      cellKey: ownProps.cellKey,
      classes: ownProps.classes,
      editorRef: state.editorRef,
      cell,
      managedStore,
      blankCell: ownProps.blankCell,
   };
}

export default connect(mapStateToProps, { updatedEditor, menuHidden, highlightedCell, unhighlightedCell })(Cell);
