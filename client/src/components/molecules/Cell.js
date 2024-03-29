import React from 'react';
import { useSelector } from 'react-redux';
import * as R from 'ramda';
import { focusedCell } from '../../actions/focusActions';
import { hidePopups } from '../../actions';
import { nothing, isSomething, ifThenElse } from '../../helpers';
import { createCellId, isCellFocused, createCellKey } from '../../helpers/cellHelpers';
import { isCellVisible } from '../../helpers/visibilityHelpers';
import { updateCellsInRange, rangeSelected, atEndOfRange } from '../../helpers/focusHelpers';
import {
   cellSubsheetId,
   cellText,
   statePresent,
} from '../../helpers/dataStructureHelpers';
import { usePositioning } from '../../helpers/hooks';
import SubsheetCell from './SubsheetCell';
import BlankCell from './BlankCell';
import CellInPlaceEditor from './CellInPlaceEditor';
import RangeTools from './RangeTools';

const onCellClick = (event, cell) => {
   event.preventDefault();
   ifThenElse({
      ifCond: event.shiftKey,
      thenDo: [ 
         rangeSelected, 
         hidePopups
      ],
      elseDo: [
         () => updateCellsInRange(false),
         () => focusedCell(cell),
         hidePopups
      ],
      params: { thenParams: cell }
   });
}

const createClassNames = (classes, cell, isEndCell) => {
   const backgroundClasses = cell.inCellRange && !isEndCell ? 'bg-light-light-blue ' : ''; 
   const cellBaseClasses = 'regular-cell grid-item overflow-hidden text-dark-dark-blue border-t border-l ';
   const otherClasses = classes ? classes : '';
   return cellBaseClasses + backgroundClasses + otherClasses;
};

const Cell = React.memo(({ row, column, classes, blankCell, endCell, isVisible }) => {
   const cellKey = createCellKey(row, column);
   const cell = useSelector(state => statePresent(state)[cellKey]);
   const cellHasFocus = useSelector(state => isCellFocused(cell, state));
   const [cellRef, positioning] = usePositioning();

   const renderRegularCell = cell => {
      const text = cellText(cell);
      const cellId = createCellId(row, column);
      return (
         <div
            ref={cellRef}
            className={createClassNames(classes, cell)}
            onClick={event => onCellClick(event, cell)}
            id={cellId}
            data-testid={cellId}
         >
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

   const renderBlankCell = () => <BlankCell classes={createClassNames(classes, cell, endCell)}/>;

   const renderSubsheetCell = cell => <SubsheetCell cell={cell} cellHasFocus={cellHasFocus} />;

   const renderEndOfRangeCell = cell => {
      return (
         <div className="w-full h-full relative bg-light-light-blue">
            {renderRegularCell(cell)}
            <RangeTools cell={cell} />
         </div>
      );
   }

   const renderCell =  R.cond([
      [R.isNil, nothing],
      [R.pipe(isCellVisible, R.not), nothing],
      [atEndOfRange, renderEndOfRangeCell],
      [R.thunkify(R.identity)(blankCell), renderBlankCell],
      [R.pipe(cellSubsheetId, isSomething), renderSubsheetCell],
      [R.thunkify(R.identity)(cellHasFocus), renderInPlaceEditor],
      [R.T, renderRegularCell]
   ]);

   return renderCell(cell);
});

export default Cell; 
