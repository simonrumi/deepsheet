import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { DEFAULT_COLUMN_WIDTH } from '../../constants';
import { getObjectFromArrayByKeyValue, } from '../../helpers';
import { manageFocus, manageTab, } from '../../helpers/focusHelpers';
import { triggerCreatedSheetAction, copyRange, clearRangeHighlight, maybeAbortFocus } from '../../helpers/rangeToolHelpers';
import { stateColumnWidths, cellInCellRange } from '../../helpers/dataStructureHelpers';
import { clearedFocus } from '../../actions/focusActions';
import CopyIcon from '../atoms/IconCopy';
import NewDocIcon from '../atoms/IconNewDoc';

const parentClasses = 'absolute top-0 z-10 flex flex-col border border-grey-blue p-1 bg-white';

const handleEsc = event => {
	event.preventDefault();
	maybeAbortFocus();
	clearRangeHighlight();
	clearedFocus();
}

const RangeTools = ({ cell }) => {
   const columnWidths = useSelector(state => stateColumnWidths(state));
   const [copiedRange, setCopiedRange] = useState(false);
   const rangeToolsRef = useRef();
   const widthObj = getObjectFromArrayByKeyValue('index', cell.column, columnWidths);
   const topLeftPositioning = {
      left: widthObj?.size || DEFAULT_COLUMN_WIDTH,
      top: 0,
   };
   const inCellRange = cellInCellRange(cell);

	const handleCopyRange = event => {
		event.preventDefault();
		copyRange();
		setCopiedRange(true);
	};

   const keyBindingsRangeTool = event => {
      // use https://keycode.info/ to get key values
      switch (event.keyCode) {
         case 67: // "C" for copy (paste is in CellInPlaceEditor)
            if (event.ctrlKey) {
               handleCopyRange(event);
            }
            break;

         case 9: // tab
            manageTab({ event, cell, callback: clearRangeHighlight });
            break;

			case 27: //esc
				handleEsc(event);
				break;

         default:
      }
   };

   useEffect(() => {
      if (inCellRange) {
         manageFocus({ event: null, cell, rangeToolsRef, keyBindings: keyBindingsRangeTool });
      }
   });

   return inCellRange ? (
      <div className={parentClasses} style={topLeftPositioning}>
         <div onMouseDown={handleCopyRange}>
            <CopyIcon copiedRange={copiedRange} />
         </div>
         <NewDocIcon
            classes="w-6 flex-1 mb-1"
            onMouseDownFn={triggerCreatedSheetAction}
         />
      </div>
   ) : null; // if we're not in a cell range don't do anything
   /* Note that onMouseDown is fired before onBlur, whereas onClick is after onBlur.
    * this used to be critical when the editor was separated from the cell. Might not be now, but using
    * onMouseDown is not hurting */
};

export default RangeTools;
