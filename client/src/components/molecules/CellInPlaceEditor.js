import React, { useRef, useEffect } from 'react';
import * as R from 'ramda';
import managedStore from '../../store';
import { updatedCell, hasChangedCell } from '../../actions/cellActions';
import { createdSheet } from '../../actions/sheetActions';
import { clearedFocus, updatedFocusRef } from '../../actions/focusActions';
import { replacedCellsInRage } from '../../actions/cellRangeActions';
import { startedEditing, finishedEditing } from '../../actions/undoActions'; 
import { updatedClipboard } from '../../actions/clipboardActions';
import {
   capturedSystemClipboard,
   updatedShowPasteOptionsModal,
   updatedCellEditorPositioning,
	updatedBlurEditorFunction,
} from '../../actions/pasteOptionsModalActions';
import { isNothing, isSomething, ifThen, runIfSomething } from '../../helpers';
import { getUserInfoFromCookie } from '../../helpers/userHelpers';
import { createDefaultAxisSizing } from '../../helpers/axisSizingHelpers';
import { manageKeyBindings, manageTab } from '../../helpers/focusHelpers';
import {
   pasteCellRangeToTarget,
   updateSystemClipboard,
   convertTextToCellRange,
} from '../../helpers/clipboardHelpers';
import { compareCellsArrays, updateCellsInRange } from '../../helpers/rangeToolHelpers';
import { createCellKey } from '../../helpers/cellHelpers';
import {
   stateSheetId,
   stateCell,
   cellText,
   cellRow,
   cellColumn,
   stateOriginalValue,
   stateOriginalRow,
   stateOriginalColumn,
   stateFocusAbortControl,
   stateCellRangeFrom,
   stateCellRangeTo,
   stateCellRangeCells,
	stateRangeWasCopied,
   stateClipboard,
	stateShowPasteOptionsModal,
} from '../../helpers/dataStructureHelpers';
import NewDocIcon from '../atoms/IconNewDoc';
import CloseIcon from '../atoms/IconClose';
import PasteIcon from '../atoms/IconPaste';
import CheckmarkSubmitIcon from '../atoms/IconCheckmarkSubmit';
import { DEFAULT_TOTAL_ROWS, DEFAULT_TOTAL_COLUMNS, DEFAULT_COLUMN_WIDTH, DEFAULT_ROW_HEIGHT, LOG } from '../../constants';
import { SYSTEM_CLIPBOARD_UNAVAILABLE_MSG } from '../displayText';
import { log } from '../../clientLogger';

const reinstateOriginalValue = cell => ifThen({
   ifCond: cell.row === stateOriginalRow(managedStore.state) && cell.column === stateOriginalColumn(managedStore.state),
   thenDo: updatedCell,
   params: {
      thenParams: {
         ...cell,
         content: { ...cell.content, text: stateOriginalValue(managedStore.state) },
         isStale: false,
      }
   }
});

const triggerCreatedSheetAction = cell => {
   const rows = DEFAULT_TOTAL_ROWS;
   const columns = DEFAULT_TOTAL_COLUMNS;
   const title = cellText(cell) || null;
   const parentSheetId = stateSheetId(managedStore.state);
   const parentSheetCell = cell;
   const rowHeights = createDefaultAxisSizing(DEFAULT_TOTAL_ROWS, DEFAULT_ROW_HEIGHT);
   const columnWidths = createDefaultAxisSizing(DEFAULT_TOTAL_COLUMNS, DEFAULT_COLUMN_WIDTH);
   const { userId } = getUserInfoFromCookie();
   createdSheet({ rows, columns, title, parentSheetId, parentSheetCell, rowHeights, columnWidths, userId });
}

const manageChange = (event, cell) => {
   event.preventDefault();
   updatedCell({
      ...cell,
      content: { ...cell.content, text: event.target.value },
      isStale: true,
   });
}

const CellInPlaceEditor = ({ cell, positioning, cellHasFocus }) => {
   // this ref is applied to the text area (see below) so that we can manage its focus
   const cellInPlaceEditorRef = useRef();

   const finalizeCellContent = (cell, isPastingCellRange) => {
      if (!R.equals(stateOriginalValue(managedStore.state), cellInPlaceEditorRef.current?.value)) {
         hasChangedCell({
            row: cellRow(cell),
            column: cellColumn(cell),
         });
      }
      finishedEditing({
         value: isSomething(cellInPlaceEditorRef.current) ? cellInPlaceEditorRef.current.value : null,
         message: 'edited row ' + cellRow(cell) + ', column ' + cellColumn(cell),
			isPastingCellRange
      });
   }

   const handleSubmit = event => {
      event.preventDefault();
      stateFocusAbortControl(managedStore.state).abort();
      finalizeCellContent(cell, cellInPlaceEditorRef);
      clearedFocus();
   }
   
   const handleCancel = event => {
      event.preventDefault();
      stateFocusAbortControl(managedStore.state).abort();
      reinstateOriginalValue(cell); // note: this does the updatedCell call
      finishedEditing({
         value: isSomething(cellInPlaceEditorRef.current) ? cellInPlaceEditorRef.current.value : null,
         message: 'cancelled editing row ' + cellRow(cell) + ', column ' + cellColumn(cell),
      });
		if (!stateRangeWasCopied(managedStore.state)) {
			updateCellsInRange(false); // false means we're finding then removing all the cells from the range
		}
      clearedFocus();
   }

	const pasteText = text => {
		updatedCell({
			...cell,
			content: { ...cell.content, text },
			isStale: true,
		});
	}

   const handlePaste = event => {
		runIfSomething(evt => evt.preventDefault(), event);
      // TODO have to handle what happens if the range includes hidden cells: shouldn't paste them
      
      const fromCell = stateCellRangeFrom(managedStore.state);
      const toCell = stateCellRangeTo(managedStore.state);

		if (typeof navigator.clipboard.readText === 'function') {
			updatedCellEditorPositioning({ ...positioning }); // this is needed, in some circumstances, by PasteOptionsModal
			updatedBlurEditorFunction(manageBlur); // this is needed, in some circumstances, by PasteOptionsModal
			navigator.clipboard.readText().then(
				systemClipboardText => {
					capturedSystemClipboard(systemClipboardText);

					if (isSomething(fromCell) && isSomething(toCell)) {
						if(isNothing(systemClipboardText)) {
							// we have a cell range but no clipboard so just paste the cell range
							// this is an edge case that may never happen
							pasteCellRangeToTarget(cell);
							
							// null is in place of the event, which has already had preventDefault called on it above; 
							// true indicates that we are pasting a cell range (which isn't from the clipboard)
							manageBlur(null, true); 
							return;
						}

						// there is a cell range and something in the clipboard, so covert the clipboard to an array of cells, then compare it to the actual cell range
						const clipboardCellsArr = convertTextToCellRange({ 
							text: systemClipboardText, 
							startingCellRowIndex: cellRow(fromCell), 
							startingCellColumnIndex: cellColumn(fromCell)
						});
			
						const storeCellsArr = stateCellRangeCells(managedStore.state);
						if (compareCellsArrays(clipboardCellsArr, storeCellsArr)) {
							// the system clipboard and the cell range are the same, so paste the cell range
							pasteCellRangeToTarget(cell);

							// null is in place of the event, which has already had preventDefault called on it above; 
							// true indicates that we are pasting a cell range (which isn't from the clipboard)
							manageBlur(null, true);
							return;
						}
						// system clipboard and the cell range are different, so popup dialog box asking which to use
						updatedShowPasteOptionsModal(true);						
						return;
					}
			
					// at this point there's no cell range, only something in the clipbaord
					const clipboardAsCells = convertTextToCellRange({ 
						text: systemClipboardText,
						startingCellRowIndex: cellRow(cell), 
						startingCellColumnIndex: cellColumn(cell)
					});
					if (clipboardAsCells.length > 1) {
						replacedCellsInRage(clipboardAsCells);
						return pasteCellRangeToTarget(cell)
							? manageBlur() // pasteCellRangeToTarget returned true, indicating a correctly formed range was pasted, so now do the blur
							: pasteText(systemClipboardText); // pasteCellRangeToTarget returned false, indicating it couldn't get a properly shaped range from the clippboard, so just paste the raw clipboard text instead
					}
					pasteText(systemClipboardText);
				}
			)
		} else {
			log({ level: LOG.WARN }, SYSTEM_CLIPBOARD_UNAVAILABLE_MSG);
			if (isSomething(fromCell) && isSomething(toCell)) {
				pasteCellRangeToTarget(cell);
				manageBlur();
				return;
			}
		}
   }

   const keyBindingsCellInPlaceEditor = event => {
      // use https://keycode.info/ to get key values
      switch(event.keyCode) {
         case 27: // esc
				console.log('-----CellInPlaceEditor esc key was pressed about to call handleCancel-----');
            handleCancel(event);
            break;
         case 13: // enter
            handleSubmit(event);
            break;
         case 9: // tab
            manageTab({ event, cell, callback: () => finalizeCellContent(cell, cellInPlaceEditorRef) });
            break;

         case 67: // "C" for copy
            if (event.ctrlKey) {
               const text = R.pipe(
                  createCellKey,
                  stateCell(managedStore.state),
                  cellText
               )(cellRow(cell), cellColumn(cell));
               updatedClipboard({ text });
               updateSystemClipboard(text);
            }
            break;
         case 86: // "V" for paste 
            if (event.ctrlKey) {
					handlePaste(event);               
            } 
            break;
            
         default:
      }
   };
   
   const manageBlur = (event, isPastingCellRange) => {
      runIfSomething(evt => evt.preventDefault, event);
		if (stateShowPasteOptionsModal(managedStore.state)) {
			//the PasteOptionsModal has popped up, so we should not blur, so the focus is retained for that modal
			return; 
		}
      R.pipe(
			stateFocusAbortControl,
			abortControl => runIfSomething(abortCtrl => abortCtrl.abort(), abortControl)
		)(managedStore.state);
		console.log('CellInPlaceEditor--manageBlur about to call finalizeCellContent with cell', cell);
      finalizeCellContent(cell, isPastingCellRange);
      updatedFocusRef({ ref: null }); // clear the existing focusRef
      clearedFocus();
   }

   const manageCellInPlaceEditorFocus = event => {
      ifThen({
         ifCond: manageKeyBindings, // returns true if the focus needed to be updated
         thenDo: [
            () => cellInPlaceEditorRef.current.selectionStart = 0,
            () => cellInPlaceEditorRef.current.selectionEnd = cellText(cell).length,
            () => startedEditing(cell)
         ],
         params: { ifParams: { event, cell, cellRef: cellInPlaceEditorRef, keyBindings: keyBindingsCellInPlaceEditor } }
      });
   }

   const renderPasteIcon = () => isSomething(stateClipboard(managedStore.state))
      ? <PasteIcon classes="bg-white mb-1" svgClasses="w-6" onMouseDownFn={handlePaste}/>
      : null;

   const renderIcons = () => {
      const leftPositioning = {
         left: positioning.width
      }

      return (
         <div className="relative w-full">
            <div
               className="absolute top-0 z-10 flex flex-col bg-white border border-grey-blue shadow-lg p-1"
               style={leftPositioning}>
               {/* onMouseDown is fired before onBlur, whereas onClick is after onBlur. 
               Since the textarea has the focus, clicking on NewDocIcon will cause
               the editor's onBlur to fire...but we need to call another action before the onBlur,
               hence the use of onMouseDown */}
               <CheckmarkSubmitIcon classes="bg-white mb-1" svgClasses="w-6" onMouseDownFn={handleSubmit} />
               <CloseIcon classes="bg-white mb-1" svgClasses="w-6" onMouseDownFn={handleCancel} />
               {renderPasteIcon()}
               <NewDocIcon classes="mb-1" svgClasses="w-6" onMouseDownFn={() => triggerCreatedSheetAction(cell)} />
            </div>
         </div>
      );
   };

   const renderTextForm = () => {
      const textArea = (
         <form onSubmit={handleSubmit} >
            {renderIcons()}
            <textarea
               className="focus:outline-none border-2 border-subdued-blue p-1 shadow-lg w-full h-full" 
               ref={cellInPlaceEditorRef}
               rows="3"
               value={cellText(cell)}
               onChange={evt => manageChange(evt, cell)}
               onBlur={manageBlur}
            />
         </form>
      );
      return textArea;
   };

   // TODO replace setTimeouts with useEffect elsewhere
   // need to useEffect so the cellInPlaceEditorRef can first be assigned to the textarea
   useEffect(() => {
      if (cellHasFocus && isSomething(cellInPlaceEditorRef.current)) {
         cellInPlaceEditorRef.current.focus();
         manageCellInPlaceEditorFocus(null);
      }
   });

   return (
      <div style={positioning} className="absolute z-10 bg-white text-dark-dark-blue " >
         {renderTextForm()}
      </div>
   );
}

export default CellInPlaceEditor; 
