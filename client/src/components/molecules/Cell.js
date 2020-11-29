import React from 'react';
import { useSelector } from 'react-redux';
import * as R from 'ramda';
import { updatedEditor } from '../../actions/editorActions';
import { focusedCell } from '../../actions/focusActions';
import { menuHidden } from '../../actions/menuActions';
import { createdSheet } from '../../actions/sheetActions';
import { startedUndoableAction } from '../../actions/undoActions';
import { nothing, isSomething, isNothing } from '../../helpers';
import { createClassNames, createCellId, isCellFocused, createCellKey } from '../../helpers/cellHelpers';
import { isCellVisible } from '../../helpers/visibilityHelpers';
import { cellSubsheetId, stateSheetId, cellRow, cellColumn, cellText, statePresent, stateEditorRef } from '../../helpers/dataStructureHelpers';
import SubsheetCell from './SubsheetCell';
import IconNewDoc from '../atoms/IconNewDoc';
import { getUserInfoFromCookie } from '../../helpers/userHelpers';
import managedStore from '../../store';

const Cell = props => {
   // TODO: Note that these useSelector() lines were moved to the top....previosuly at bottom...hopefully wont casue an issue
   const { row, column } = props.cell;
   const cellKey = createCellKey(row, column);
   const cellReducer = useSelector(state => statePresent(state)[cellKey]);
   const cellHasFocus = useSelector(state => isCellFocused(props.cell, state));
   const editorRef = useSelector(state => stateEditorRef(state));

   const triggerCreatedSheetAction = () => {
      const rows = null;
      const columns = null;
      const title = null;
      const parentSheetId = stateSheetId(managedStore.state);
      const summaryCell = { row: 0, column: 0 }; // this would be to tell which cell in the new sheet is the summary cell. Default is 0,0
      const parentSheetCell = cellReducer;
      const { userId } = getUserInfoFromCookie();
      createdSheet({ rows, columns, title, parentSheetId, summaryCell, parentSheetCell, userId });
   }

   const renderIconNewDoc = () => {
      /* onMouseDown is fired before onBlur, whereas onClick is after onBlur. 
         Since the Editor has the focus when a cell is clicked, clicking on IconNewDoc will cause
         the Editor's onBlur to fire...but we need to call triggerCreatedSheet action before the onBlur,
         hence the use of onMouseDown */
      return <IconNewDoc classes="w-4 flex-1" onMouseDownFn={triggerCreatedSheetAction} />;
   }

   const renderIcons = cellHasFocus => {
      if (cellHasFocus) {
         return (
            <div className="relative w-full">
               <div className="absolute bottom-4 left-0 z-10 w-1/3 flex justify-start">{renderIconNewDoc()}</div>
            </div>
         );
      }
      return null;
   }

   const onCellClick = () => {
      startedUndoableAction();
      focusedCell(cellReducer);
      updatedEditor(cellReducer);
      menuHidden(); // in case the menu was showing, hide it

      // need this setTimeout to ensure the code runs on the next tick,
      // otherwise the EditorInput is disabled when given the focus
      // bit of a hack but seemed to be an accepted workaround.
      window.setTimeout(() => {
         if (editorRef.current) {
            editorRef.current.focus();
         }
      }, 0);
   }

   const renderRegularCell = cell => {
      const row = cellRow(cell);
      const column = cellColumn(cell);
      const text = cellText(cell);
      return (
         <div
            className={createClassNames(props.classes, cellHasFocus)}
            onClick={onCellClick}
            id={createCellId(row, column)}>
            {renderIcons(cellHasFocus)}
            {text}
         </div>
      );
   }

   const renderBlankCell = cell => <div className={createClassNames(props.classes)} />;

   const renderSubsheetCell = cell => <SubsheetCell cell={cell} />;

   const renderCell = cellReducer => {
      return R.cond([
         [R.isNil, nothing],
         [R.pipe(isCellVisible, R.not), nothing],
         [R.thunkify(R.identity)(props.blankCell), renderBlankCell],
         [R.pipe(cellSubsheetId, isSomething), renderSubsheetCell],
         [R.pipe(cellSubsheetId, isNothing), renderRegularCell],
      ])(cellReducer);
   };

   
   return renderCell(cellReducer);
}

export default Cell; 
