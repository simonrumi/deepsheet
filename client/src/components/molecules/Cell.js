import React from 'react';
import { useSelector } from 'react-redux';
import * as R from 'ramda';
import { focusedCell } from '../../actions/focusActions';
import { hidePopups } from '../../actions';
import { nothing, isSomething, isNothing } from '../../helpers';
import { createCellId, isCellFocused, createCellKey } from '../../helpers/cellHelpers';
import { isCellVisible } from '../../helpers/visibilityHelpers';
import {
   cellSubsheetId,
   cellRow,
   cellColumn,
   cellText,
   statePresent,
   stateSummaryCell,
   stateParentSheetId,
} from '../../helpers/dataStructureHelpers';
import { usePositioning } from '../../helpers/hooks';
import SubsheetCell from './SubsheetCell';
import SummaryCell from './SummaryCell';
import CellInPlaceEditor from './CellInPlaceEditor';

const Cell = props => {
   const { row, column } = props.cell;
   const cellKey = createCellKey(row, column);
   const cellReducer = useSelector(state => statePresent(state)[cellKey]);
   const cellHasFocus = useSelector(state => isCellFocused(props.cell, state));
   const summaryCell = useSelector(state => stateSummaryCell(state));
   const parentSheetId = useSelector(state => stateParentSheetId(state))
   const [cellRef, positioning] = usePositioning();

   const onCellClick = () => {
      focusedCell(cellReducer);
      hidePopups();
   }

   const createClassNames = classes => {
      const cellBaseClasses = 'grid-item overflow-hidden text-dark-dark-blue border-t border-l ';
      const otherClasses = classes ? classes : '';
      return cellBaseClasses + otherClasses;
   };

   const renderRegularCell = cell => {
      const row = cellRow(cell);
      const column = cellColumn(cell);
      const text = cellText(cell);
      return (
         <div
            ref={cellRef}
            className={createClassNames(props.classes, cellHasFocus)}
            onClick={onCellClick}
            id={createCellId(row, column)}>
            {text}
         </div>
      );
   }

   const renderInPlaceEditor = cell => (
         <div className="w-full">
            {renderRegularCell(cell)}
            <CellInPlaceEditor positioning={positioning} cell={cell} cellHasFocus={cellHasFocus} />
         </div>
      );

   const renderSummaryCell = cell => <SummaryCell cell={cell} cellHasFocus={cellHasFocus} />
      
   const isSummaryCell = () => isSomething(parentSheetId) && summaryCell?.row === row && summaryCell?.column === column;

   const renderBlankCell = cell => <div className={createClassNames(props.classes)} />;

   const renderSubsheetCell = cell => <SubsheetCell cell={cell} />;

   const renderCell = cellReducer => {
      return R.cond([
         [R.isNil, nothing],
         [R.pipe(isCellVisible, R.not), nothing],
         [R.thunkify(R.identity)(props.blankCell), renderBlankCell],
         [R.pipe(cellSubsheetId, isSomething), renderSubsheetCell],
         [R.thunkify(R.identity)(cellHasFocus), renderInPlaceEditor],
         [isSummaryCell, renderSummaryCell],
         [R.pipe(cellSubsheetId, isNothing), renderRegularCell],
      ])(cellReducer);
   };

   return renderCell(cellReducer);
}

export default Cell; 
