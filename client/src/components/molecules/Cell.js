import React, { /* useMemo */ } from 'react';
// import managedStore from  '../../store';
import { useSelector } from 'react-redux';
import * as R from 'ramda';
import { focusedCell, /* highlightedCellRange */ } from '../../actions/focusActions';
import { hidePopups } from '../../actions';
import { updatedCell } from '../../actions/cellActions';
import { nothing, isSomething, isNothing } from '../../helpers';
import { createCellId, isCellFocused, createCellKey, isCellInRange } from '../../helpers/cellHelpers';
import { isCellVisible } from '../../helpers/visibilityHelpers';
import {
   cellSubsheetId,
   cellRow,
   cellColumn,
   cellText,
   statePresent,
   stateSummaryCell,
   stateParentSheetId,
   // statePreviouslyFocusedCell,
   // stateCellRange,
} from '../../helpers/dataStructureHelpers';
import { usePositioning } from '../../helpers/hooks';
import SubsheetCell from './SubsheetCell';
import SummaryCell from './SummaryCell';
import BlankCell from './BlankCell';
import CellInPlaceEditor from './CellInPlaceEditor';

// TODO might be reinstating this when getting cell range selection to work
/* const onCellClick = (event, cell) => {
   event.preventDefault();
   if (event.shiftKey) {
      console.log('Cell.onCellClick got managedStore.state', managedStore.state);
      const previousCell = statePreviouslyFocusedCell(managedStore.state); // TODO note that previouslyFocusedCell has been removed from focusReducer.js....it may have been causing issues with tabbing
      console.log('shift click range from', previousCell, 'to', cell);
      if (previousCell && (previousCell.row !== cell.row || previousCell.column !== cell.column)) {
         console.log('Cell.onCellClick shift click range valid');
         highlightedCellRange(cell);
      }
   } else {
      console.log('Cell.onCellClick had no shift key so now going to focusCell', cell);
      focusedCell(cell);
   }
   hidePopups();
} */

const onCellClick = cell => {
   focusedCell(cell);
   hidePopups();
}

// TODO might need to reinstate this cellRange stuff, but it is causing all cells to re-render unnecessarily, so need to select particular cells to re-render somehow
const createClassNames = (classes, /*row, column cellRange */) => {
   const borderClasses = ''; //isCellInRange(row, column, cellRange) ? 'border-burnt-orange ' : ''; 
   const cellBaseClasses = 'grid-item overflow-hidden text-dark-dark-blue border-t border-l ';
   const otherClasses = classes ? classes : '';
   return cellBaseClasses + borderClasses + otherClasses;
};

const Cell = React.memo(({ row, column, classes, blankCell }) => { // cellRange // TODO might need to reinstate cellRange, but it is causing unnecessary rerenderings so find a way to make it targeted
   const cellKey = createCellKey(row, column);
   const cell = useSelector(state => statePresent(state)[cellKey]);
   const cellHasFocus = useSelector(state => isCellFocused(cell, state));
   const summaryCell = useSelector(state => stateSummaryCell(state));
   const parentSheetId = useSelector(state => stateParentSheetId(state));
   // const cellRange = useSelector(state => stateCellRange(state)); // TODO remove if not needed
   const [cellRef, positioning] = usePositioning();

// TODO - react to HIGHLIGHTED_CELL_RANGE action in some way that will put some border around the whole range
// have started this BUT now we are running even more calcs on every cell each time the cellRange is updated, which is all the time
// need to have a new scheme in Cells.js that can memoize cells so we don't keep re-rendering

   const renderRegularCell = cell => {
      const text = cellText(cell);
      return (
         <div
            ref={cellRef}
            className={createClassNames(classes)}
            onClick={() => onCellClick(cell)}
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

   const renderSummaryCell = cell => <SummaryCell cell={cell} />
      
   const isSummaryCell = () => isSomething(parentSheetId) && summaryCell?.row === row && summaryCell?.column === column;

   const renderBlankCell = () => <BlankCell classes={createClassNames(classes)} />;

   const renderSubsheetCell = cell => <SubsheetCell cell={cell} cellHasFocus={cellHasFocus}/>;

   const renderCell =  R.cond([
      [R.isNil, nothing],
      [R.pipe(isCellVisible, R.not), nothing],
      [R.thunkify(R.identity)(blankCell), renderBlankCell],
      [R.pipe(cellSubsheetId, isSomething), renderSubsheetCell],
      [R.thunkify(R.identity)(cellHasFocus), renderInPlaceEditor],
      [isSummaryCell, renderSummaryCell],
      [R.T, renderRegularCell]
   ]);

   return renderCell(cell);
});

export default Cell; 
