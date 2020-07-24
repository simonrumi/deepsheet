import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { updatedEditor } from '../../actions/editorActions';
import { highlightedCell } from '../../actions/cellActions';
import { menuHidden } from '../../actions/menuActions';
import { createdSheet } from '../../actions/sheetActions';
import { extractRowColFromCellKey, nothing, isSomething, isNothing } from '../../helpers';
import { createClassNames, createCellId } from '../../helpers/cellHelpers';
import {
   cellSubsheetId,
   stateCellIsHighlighted,
   stateSheetId,
   stateEditorRow,
   stateEditorColumn,
} from '../../helpers/dataStructureHelpers';
import managedStore from '../../store';
import SubsheetCell from './SubsheetCell';
import IconNewDoc from '../atoms/IconNewDoc';

class Cell extends Component {
   constructor(props) {
      super(props);
      this.renderCell = this.renderCell.bind(this);
      this.renderRegularCell = this.renderRegularCell.bind(this);
      this.renderSubsheetCell = this.renderSubsheetCell.bind(this);
      this.renderBlankCell = this.renderBlankCell.bind(this);
      this.renderNewDocIcon = this.renderNewDocIcon.bind(this);
      this.triggerCreatedSheetAction = this.triggerCreatedSheetAction.bind(this);
   }

   triggerCreatedSheetAction() {
      const rows = null;
      const columns = null;
      const title = null;
      const parentSheetId = stateSheetId(this.props.state);
      const summaryCell = null; // this would be to tell which cell in the new sheet is the summary cell. Default is 0,0  - probably never will set this in advance
      const parentSheetCell = this.props.cell;
      this.props.createdSheet({ rows, columns, title, parentSheetId, summaryCell, parentSheetCell });
   }

   renderNewDocIcon(isHighlighted) {
      const cellCoordinates = {
         row: stateEditorRow(this.props.state),
         column: stateEditorColumn(this.props.state),
      };
      return isHighlighted ? (
         <div className="relative">
            {/* onMouseDown is fired before onBlur, whereas onClick is after onBlur. 
            Since the Editor has the focus when a cell is clicked, clicking on IconNewDoc will cause
            the Editor's onBlur to fire...but we need to call triggerCreatedSheet action before the onBlur,
            hence the use of onMouseDown */}
            <IconNewDoc
               classes="w-4 z-10 absolute bottom-0 left-0"
               cellCoordinates={cellCoordinates}
               onMouseDownFn={this.triggerCreatedSheetAction}
            />
         </div>
      ) : null;
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
            {this.renderNewDocIcon(isHighlighted)}
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
      [R.pipe(cellSubsheetId, isSomething), this.renderSubsheetCell],
      [R.pipe(cellSubsheetId, isNothing), this.renderRegularCell],
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

export default connect(mapStateToProps, {
   updatedEditor,
   menuHidden,
   highlightedCell,
   createdSheet,
})(Cell);
