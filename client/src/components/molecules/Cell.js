import React from 'react';
import { useSelector } from 'react-redux';
import * as R from 'ramda';
import managedStore from '../../store';
import { focusedCell } from '../../actions/focusActions';
import { hidePopups } from '../../actions';
import { nothing, isSomething, ifThen, ifThenElse } from '../../helpers';
import { createCellId, isCellFocused, createCellKey } from '../../helpers/cellHelpers';
import { isCellVisible } from '../../helpers/visibilityHelpers';
import { rangeSelected, atEndOfRange, maybeClearSubsheetCellFocus } from '../../helpers/focusHelpers';
import { clearRangeHighlight } from '../../helpers/rangeToolHelpers';
import {
   cellSubsheetId,
   cellText,
   cellInCellRange,
   statePresent,
	stateCellRangeTo,
} from '../../helpers/dataStructureHelpers';
import { usePositioning } from '../../helpers/hooks';
import SubsheetCell from './SubsheetCell';
import BlankCell from './BlankCell';
import CellInPlaceEditor from './CellInPlaceEditor';
import RangeTools from './RangeTools';

const onCellClick = (event, cell) => {
	console.log('***************** Cell click started ***************');
   event.preventDefault();
   ifThenElse({
      ifCond: event.shiftKey,
      thenDo: [rangeSelected, maybeClearSubsheetCellFocus, hidePopups],
      elseDo: [
         () => {
				focusedCell(cell)
			},
         () => ifThen({
				ifCond: R.pipe(stateCellRangeTo, isSomething),
				thenDo: clearRangeHighlight,
				params: { ifParams: managedStore.state },
			}),
         hidePopups,
      ],
      params: { thenParams: cell },
   });
}

const createClassNames = ({ classes, inCellRange, isEndCell }) => {
   const backgroundClasses = inCellRange && !isEndCell ? 'bg-light-light-blue ' : '';
   const cellBaseClasses = 'regular-cell col-span-1 row-span-1 w-full h-full p-0.5 overflow-hidden text-dark-dark-blue border-t border-l ';
   const otherClasses = classes ? classes : '';
   return cellBaseClasses + backgroundClasses + otherClasses;
};

const Cell = React.memo(({ row, column, classes, blankCell, endCell, isVisible }) => {
   const cellKey = createCellKey(row, column);
   const cell = useSelector(state => statePresent(state)[cellKey]);
   const cellHasFocus = useSelector(state => isCellFocused(cell, state));
   const [cellRef, positioning] = usePositioning();
   const isSubsheetCell = R.pipe(cellSubsheetId, isSomething); // expects to get cell as a param

   const inCellRange = cellInCellRange(cell);

   const renderRegularCell = cell => {
     const text = cellText(cell);
      const cellId = createCellId(row, column);
      return (
         <div
            ref={cellRef}
            className={createClassNames({ classes, inCellRange, isEndCell: endCell })}
            onClick={event => onCellClick(event, cell)}
            id={cellId}
            data-testid={cellId}
         >
            {text}
         </div>
      );
   }

   const renderInPlaceEditor = cell => {
         return <div className="w-full">
            {renderRegularCell(cell)}
            <CellInPlaceEditor positioning={positioning} cell={cell} cellHasFocus={cellHasFocus} />
         </div>;
	};

	const renderRangeTools = () => blankCell ? null : <RangeTools cell={cell} />;

   const renderBlankCell = () => <BlankCell classes={createClassNames({ classes, inCellRange, isEndCell: endCell })}/>;

   const renderSubsheetCell = cell => <SubsheetCell cell={cell} cellHasFocus={cellHasFocus} />;

   const renderEndOfRangeCell = cell => {
      return (
         <div className="w-full h-full relative">
            {isSubsheetCell(cell) ? renderSubsheetCell(cell) : renderRegularCell(cell)}
            {renderRangeTools()}
         </div>
      );
   }

	const shouldRenderEndOfRangeCell = cell => atEndOfRange(cell) && cellInCellRange(cell);

   const renderCell =  R.cond([
      [R.isNil, nothing],
      [R.pipe(isCellVisible, R.not), nothing],
      [shouldRenderEndOfRangeCell, renderEndOfRangeCell],
      [R.thunkify(R.identity)(blankCell), renderBlankCell],
      [isSubsheetCell, renderSubsheetCell],
      [R.thunkify(R.identity)(cellHasFocus), renderInPlaceEditor],
      [R.T, renderRegularCell]
   ]);
   return renderCell(cell);
});

export default Cell; 
