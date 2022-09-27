import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import * as R from 'ramda';
import managedStore from '../../store';
import { hidePopups } from '../../actions';
import { focusedCell, updatedEditorState } from '../../actions/focusActions';
// import { updatedCellPositioning } from '../../actions/cellActions'; // TIDY
import { updatedCellPositioning } from '../../actions/focusActions';
import { nothing, isSomething, isNothing, ifThen, ifThenElse } from '../../helpers';
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
			// R.pipe(getInitialEditorState, updatedEditorState), // TODO either update getInitialEditorState or ALMOST CERTAINLY don't do this if it is already baked into the cell
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
   const isSubsheetCell = R.pipe(cellSubsheetId, isSomething); // expects to get cell as a param
	const totalCells = stateTotalRows(managedStore.state) * stateTotalColumns(managedStore.state);
   const [cellRef, positioning] = usePositioning(row === 2 && column === 6, totalCells); // TIDY:  row === 2 && column === 6, cell ...this is a temp thing for console logging
	// const [isRenderingEditor, setIsRenderingEditor] = useState(false);

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
            className={createClassNames({ classes, inCellRange, isEndCell: endCell })}
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
		console.log('Cell--renderInPlaceEditor got cell', cell, 'positioning', positioning);
		// setIsRenderingEditor(true); // TIDY probably not using this
		
		return <div className="w-full">
			{/* renderRegularCell(cell) // TODO used to do this, but now with the cell editor working, probably should render a blank cell here */}
			<CellInPlaceEditor positioning={positioning} cellToEdit={cell} cellHasFocus={cellHasFocus} key={cellKey + '_inPlaceEditor'} />
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
