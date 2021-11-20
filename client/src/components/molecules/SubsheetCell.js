import React, { useRef, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import * as R from 'ramda';
import managedStore from '../../store';
import { hidePopups } from '../../actions';
import { focusedCell, clearedFocus, updatedFocusRef } from '../../actions/focusActions';
import { ifThen, ifThenElse, isSomething, runIfSomething } from '../../helpers';
import {
   cellText,
   cellRow,
   cellColumn,
	cellInCellRange,
   stateFocusAbortControl,
   stateFocusCell,
   stateFocusCellRef,
   stateCellRangeTo,
} from '../../helpers/dataStructureHelpers';
import { manageKeyBindings, manageTab, rangeSelected, maybeClearSubsheetCellFocus } from '../../helpers/focusHelpers';
import { clearRangeHighlight, maybeAbortFocus, } from '../../helpers/rangeToolHelpers';
import SubsheetCellTools from './SubsheetCellTools';
import { log } from '../../clientLogger';
import { LOG } from '../../constants';

const innerDivClassNames = cellHasFocus => {
   const cellBaseClasses = 'p-px ';
   const borderClasses = cellHasFocus ? 'border-2 border-vibrant-purple' : 'border border-pale-purple';
   return cellBaseClasses + borderClasses;
};

const manageEsc = event => {
   event.preventDefault();
   maybeAbortFocus();
   updatedFocusRef({ ref: null }); // clear the existing focusRef
   clearedFocus();
}

const SubsheetCell = ({ cell, cellHasFocus }) => {
   const cellRef = useRef();
	const cellFocused = useSelector(state => stateFocusCell(state));
	const cellFocusedRef = useSelector(state => stateFocusCellRef(state));
	const cellIsCurrentlyFocused = isSomething(cellFocusedRef) && cellRow(cellFocused) === cellRow(cell) && cellColumn(cellFocused) === cellColumn(cell)
	const inCellRange = cellInCellRange(cell);

	const keyBindingsSubsheetCell = event => {
		// use https://keycode.info/ to get key values
		// apparently should be using event.key instead, but it returns values like "Enter" and "Tab" so need to handle both
		switch(event.keyCode) {
			case 27: // esc
				manageEsc(event);
				break;
			case 9: // tab
				manageTab({ event, cell });
				break;
			default:
		}
	};

	// note when a cell is clicked onSubsheetCellClick will focus the cell, which will cause the useEffect below to fire this manageFocus function
	// whereas when a cell is tabbed into, the focus will be updated by the manageTab function, again causing the useEffect below to fire this function
	const manageFocus = event => {
		manageKeyBindings({ event, cell, cellRef, keyBindings: keyBindingsSubsheetCell });
	}

   useEffect(() => {
      ifThen({
         ifCond: cellHasFocus,
         thenDo: () => manageFocus(null), // null becuase there is no event to send
         params: {} 
      });
   });

   // note this cell is an item within the large grid which is the spreadsheet
   // while these classes create a 1x1 grid that takes up the full space within that:
   // grid items-stretch
	const baseClasses = 'col-span-1 row-span-1 w-full h-full p-0.5 grid items-stretch cursor-pointer border-t border-l';

   const memoizedSubsheetCell = useMemo(() => {
		console.log(
         'SubsheetCell about to render; got cellIsCurrentlyFocused',
         cellIsCurrentlyFocused,
         /* 'vs cellHasFocus',
         cellHasFocus, */
			'cell.inCellRange',
			cell.inCellRange,
         'for cell',
         cell
      );
	
		const onSubsheetCellClick = event => {
			event.preventDefault();
			console.log('************** SubsheetCell--onSubsheetCellClick started ****************');
			ifThenElse({
				ifCond: event.shiftKey,
				thenDo: [ rangeSelected, maybeClearSubsheetCellFocus, hidePopups ],
				elseDo: [
					() => focusedCell(cell),
					() => ifThen({
						ifCond: R.pipe(stateCellRangeTo, isSomething),
						thenDo: clearRangeHighlight,
						params: { ifParams: managedStore.state }
					}),
					hidePopups,
				],
				params: { thenParams: cell }
			});
		}
	
		// this doesn't seem to get called, but keeping it here just in case
		const manageBlur = event => {
			runIfSomething(evt => evt.preventDefault, event);
			R.pipe(
				stateFocusAbortControl,
				abortControl => runIfSomething(abortCtrl => abortCtrl.abort(), abortControl)
			)(managedStore.state);
			log({ level: LOG.DEBUG }, 'SubsheetCell--manageBlur about to call updatedFocusRef & clearedFocus');
			updatedFocusRef({ ref: null }); // clear the existing focusRef
			clearedFocus();
		}

   	const backgroundClasses = inCellRange ? ' bg-light-light-blue' : '';
		return (
			<div
				className={baseClasses + backgroundClasses}
				onBlur={manageBlur}
			>
				<div 
					className={innerDivClassNames(cellIsCurrentlyFocused)} 
					ref={cellRef}
					onClick={onSubsheetCellClick}
				>
					<SubsheetCellTools cell={cell} cellHasFocus={cellIsCurrentlyFocused} />
					{cellText(cell)}
				</div>
			</div>
			);
		},
		[ cellIsCurrentlyFocused, inCellRange, cell ]
	);
   // not adding an onFocus handler into the div as we are handling focus with the useEffect
	
	return memoizedSubsheetCell;
	// return renderSubsheetCell();
};
// ); // TIDY

export default SubsheetCell;
