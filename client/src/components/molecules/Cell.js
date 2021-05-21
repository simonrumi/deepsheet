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


// TODO in the middle of using the diagram
// https://app.diagrams.net/#G1OYD5_yBQFAiodyU8aDO42pz7UqV5YMb_
// ...to organizing when the cells are rendering...seems like Sheet and Cells are good
// ....Cell now has React.memo on it.....probably doing something but could use more testing
// then need to look at CellInPlaceEditor and SubsheetCell and SummarycCell

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
   console.log('Cell.onCellClick about to call focusedCell() for cell row', cell.row, 'cell.column', cell.column);
   focusedCell(cell);
   updatedCell(cell);
   hidePopups();
}

const createClassNames = (classes, row, column, cellRange) => {
   const borderClasses = isCellInRange(row, column, cellRange) ? 'border-burnt-orange ' : '';
   const cellBaseClasses = 'grid-item overflow-hidden text-dark-dark-blue border-t border-l ';
   const otherClasses = classes ? classes : '';
   return cellBaseClasses + borderClasses + otherClasses;
};

const Cell = React.memo(({ row, column, cellRange, classes, blankCell }) => {
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
            className={createClassNames(classes, row, column, cellRange)}
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

   const renderSummaryCell = cell => <SummaryCell cell={cell} cellHasFocus={cellHasFocus} />
      
   const isSummaryCell = () => isSomething(parentSheetId) && summaryCell?.row === row && summaryCell?.column === column;

   const renderBlankCell = () => <BlankCell classes={createClassNames(classes)} />;

   const renderSubsheetCell = cell => <SubsheetCell cell={cell} />;

// TODO memoized version doesn't seem to prevent any cell rendering, so get rid of this if not needed
// ...using react.memo instead...seems to be doing the trick

   // const cellNotVisible = R.pipe(isCellVisible, R.not);

   /* const renderedCell = useMemo(() => {
      const returnVal = R.cond([
         [R.isNil, nothing],
         [cellNotVisible, nothing],
         [R.thunkify(R.identity)(blankCell), renderBlankCell],
         [R.pipe(cellSubsheetId, isSomething), renderSubsheetCell],
         [R.thunkify(R.identity)(cellHasFocus), renderInPlaceEditor],
         [isSummaryCell, renderSummaryCell],
         [R.pipe(cellSubsheetId, isNothing), renderRegularCell],
      ])(cell);
      console.log('cell actually being rendered (not memoized)');
      return returnVal; // TODO tidy this up
      },
      [
         cell, 
         blankCell, 
         cellHasFocus, 
         isSummaryCell(), 
         cellNotVisible(cell),
         // functions below added to appease useMemo...these should never change
         isSummaryCell, 
         renderBlankCell,
         renderInPlaceEditor,
         renderRegularCell,
         renderSummaryCell
      ]
   ); */

   // return renderedCell;

   // unmemozed version
   const renderCell =  R.cond([
      [R.isNil, nothing],
      [R.pipe(isCellVisible, R.not), nothing],
      [R.thunkify(R.identity)(blankCell), renderBlankCell],
      [R.pipe(cellSubsheetId, isSomething), renderSubsheetCell],
      [R.thunkify(R.identity)(cellHasFocus), renderInPlaceEditor],
      [isSummaryCell, renderSummaryCell],
      [R.pipe(cellSubsheetId, isNothing), renderRegularCell],
   ]);

   console.log('Cell.js rendering cell');
   return renderCell(cell);
});

export default Cell; 
