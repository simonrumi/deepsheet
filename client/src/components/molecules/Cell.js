import React from 'react';
import { useSelector } from 'react-redux';
import * as R from 'ramda';
import managedStore from '../../store';
import { hidePopups } from '../../actions';
import { focusedCell } from '../../actions/focusActions';
import { nothing, isSomething, ifThen, ifThenElse } from '../../helpers';
import { createCellId, isCellFocused, createCellKey } from '../../helpers/cellHelpers';
import { isCellVisible } from '../../helpers/visibilityHelpers';
import { rangeSelected, atEndOfRange, maybeClearSubsheetCellFocus } from '../../helpers/focusHelpers';
import { clearRangeHighlight } from '../../helpers/rangeToolHelpers';
import { convertBlocksToJsx, decodeFormattedText, getFormattedText } from '../../helpers/richTextHelpers';
import {
   cellSubsheetId,
   cellInCellRange,
   statePresent,
	stateCellRangeTo,
	stateTotalRows,
	stateTotalColumns
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
      params: { thenParams: cell, elseParams: cell },
   });
}

const createClassNames = ({ classes, inCellRange, isEndCell, cellHasFocus }) => {
	const outline = cellHasFocus ? 'border border-burnt-orange ' : 'border-t border-l ';
   const backgroundClasses = inCellRange && !isEndCell ? 'bg-light-light-blue ' : cellHasFocus ? 'bg-white ' : '';
   const cellBaseClasses = 'regular-cell col-span-1 row-span-1 w-full h-full p-0.5 overflow-hidden text-dark-dark-blue ';
   const otherClasses = classes ? classes : '';
   return cellBaseClasses + outline + backgroundClasses + otherClasses;
};

const Cell = React.memo(({ row, column, classes, blankCell, endCell, isVisible }) => {
   const cellKey = createCellKey(row, column);
   const cell = useSelector(state => statePresent(state)[cellKey]);
   const cellHasFocus = useSelector(state => isCellFocused(cell, state));
   const isSubsheetCell = R.pipe(cellSubsheetId, isSomething); // makes a function that expects to get cell as a param
	const totalCells = stateTotalRows(managedStore.state) * stateTotalColumns(managedStore.state);
   const [cellRef, positioning] = usePositioning(totalCells);

   const inCellRange = cellInCellRange(cell);

   const renderRegularCell = cell => {
		const jsxText = R.pipe(
			getFormattedText,
			decodeFormattedText,
			R.prop('blocks'), 
			convertBlocksToJsx
		)(cell);
      const cellId = createCellId(row, column);
      return (
         <div
            ref={cellRef}
            className={createClassNames({ classes, inCellRange, isEndCell: endCell, cellHasFocus })}
            onClick={event => onCellClick(event, cell)}
            id={cellId}
            data-testid={cellId}
				key={cellKey + (endCell ? '_endCell' : '') }
         >
            {jsxText}
         </div>
      );
   }

   const renderInPlaceEditor = cell => {
		if (R.equals(positioning, {})) {
			return null;
		}
		return <div className="w-full h-full">
			{renderRegularCell(cell)}
			<CellInPlaceEditor cellToEdit={cell} cellPositioning={positioning} cellHasFocus={cellHasFocus} key={cellKey + '_inPlaceEditor'} />
		</div>;
	};

	const renderRangeTools = () => blankCell ? null : <RangeTools cell={cell} />;

   const renderBlankCell = () => <BlankCell classes={createClassNames({ classes, inCellRange, isEndCell: endCell })} key={cellKey} />;

   const renderSubsheetCell = cell => <SubsheetCell cell={cell} cellHasFocus={cellHasFocus} key={cellKey} />;

   const renderEndOfRangeCell = cell => {
      return (
         <div className="w-full h-full relative" key={cellKey + '_endOfRange'} >
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
