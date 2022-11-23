import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import * as R from 'ramda';
import managedStore from '../../store';
import { updatedCell, hasChangedCell } from '../../actions/cellActions';
import { createdSheet } from '../../actions/sheetActions';
import {
   clearedFocus,
   updatedFocusRef,
   updatedCellPositioning,
   updatedTextSelection,
} from '../../actions/focusActions';
import { updatedPastingCellRange } from '../../actions/cellRangeActions';
import { startedEditing, finishedEditing, startedUndoableAction, completedUndoableAction, } from '../../actions/undoActions';
import { PASTE_RANGE, } from '../../actions/cellRangeTypes';
import { updatedClipboard } from '../../actions/clipboardActions';
import {
   capturedSystemClipboard,
   updatedShowPasteOptionsModal,
   updatedCellEditorPositioning, // TODO maybe not using this - using updatedCellPositioning in focusActions instead
	updatedBlurEditorFunction,
	updatedHandlingPaste,
} from '../../actions/pasteOptionsModalActions';
import { isNothing, isSomething, arrayContainsSomething, ifThen, runIfSomething } from '../../helpers';
import { getUserInfoFromCookie } from '../../helpers/userHelpers';
import { createDefaultAxisSizing } from '../../helpers/axisSizingHelpers';
import { manageFocus, manageTab } from '../../helpers/focusHelpers';
import { updateEditedChar, getCellPlainText } from '../../helpers/richTextHelpers';
import { updateStyles } from '../../helpers/richTextStyleRangeHelpers';
import {
   pasteCellRangeToTarget,
   updateSystemClipboard,
   convertTextToCellRange,
	pasteTextIntoSingleCell,
	getSystemClipboard,
} from '../../helpers/clipboardHelpers';
import { compareCellsArrays, updateCellsInRange } from '../../helpers/rangeToolHelpers';
import { createCellKey, createCellId, } from '../../helpers/cellHelpers';
import {
	statePresent,
   stateSheetId,
   stateCell,
   cellText,
   cellRow,
   cellColumn,
	cellFormattedText,
	cellFormattedTextBlocks,
	stateOriginalFormattedText,
   stateOriginalRow,
   stateOriginalColumn,
   stateFocusAbortControl,
	stateFocusTextSelection,
   stateCellRangeFrom,
   stateCellRangeTo,
   stateCellRangeCells,
	stateRangeWasCopied,
	statePastingCellRange,
   stateClipboard,
	stateSystemClipboard,
	stateShowPasteOptionsModal,
	stateIsHandlingPaste,
} from '../../helpers/dataStructureHelpers';
import { createPasteRangeUndoMessage } from '../displayText';
import NewDocIcon from '../atoms/IconNewDoc';
import CloseIcon from '../atoms/IconClose';
import PasteIcon from '../atoms/IconPaste';
import CheckmarkSubmitIcon from '../atoms/IconCheckmarkSubmit';
import {
   DEFAULT_TOTAL_ROWS,
   DEFAULT_TOTAL_COLUMNS,
   DEFAULT_COLUMN_WIDTH,
   DEFAULT_ROW_HEIGHT,
   LOG,
	BOLD,
	ITALIC,
	UNDERLINE,
	CELL_EDITOR_VERTICAL_MARGIN,
	CELL_EDITOR_HORIZONTAL_MARGIN,
	CELL_EDITOR_VERTICAL_PADDING,
} from '../../constants';
import { SYSTEM_CLIPBOARD_UNAVAILABLE_MSG, createdEditedCellMessage } from '../displayText';
import { log } from '../../clientLogger';

const triggerCreatedSheetAction = cell => {
   const rows = DEFAULT_TOTAL_ROWS;
   const columns = DEFAULT_TOTAL_COLUMNS;
   const title = getCellPlainText(cell) || null;
   const parentSheetId = stateSheetId(managedStore.state);
   const parentSheetCell = cell;
   const rowHeights = createDefaultAxisSizing(DEFAULT_TOTAL_ROWS, DEFAULT_ROW_HEIGHT);
   const columnWidths = createDefaultAxisSizing(DEFAULT_TOTAL_COLUMNS, DEFAULT_COLUMN_WIDTH);
   const { userId } = getUserInfoFromCookie();
   createdSheet({ rows, columns, title, parentSheetId, parentSheetCell, rowHeights, columnWidths, userId });
}

const reinstateOriginalValue = cell =>
	ifThen({
		ifCond:
			cell.row === stateOriginalRow(managedStore.state) &&
			cell.column === stateOriginalColumn(managedStore.state),
		thenDo: updatedCell,
		params: {
			thenParams: {
				...cell,
				content: {
					...cell.content,
					formattedText: stateOriginalFormattedText(managedStore.state),
				},
				isStale: false,
			},
		},
	});

/* // ******** OLD NOTES *******
// 1. add a column
// 2. click on a cell
// result: the cell editor is shown in the wrong place
//
// This might be to do with the usePositioning hook. It uses useCallback which returns a memoized callback
// ... look at console logs - when clicking on a cell node is null
// see this article - probably need to update the ref stuff as he says:
// https://medium.com/welldone-software/usecallback-might-be-what-you-meant-by-useref-useeffect-773bc0278ae
...think this is moot now
//
// ...Well...seems like the usePositioning hook is doing what that article suggested.
// Here's what is happening
// The Cell sends the positioning to the CellInPlaceEditor...obviously this is not getting updated correctly
// CellInPlaceEditor is receiving the correct cellToEdit, but the incorrect positioning
// the positioning is for the cell to the left of the cell that was clicked
// 
/// can't seem to set the cell positioning in the store...but shouldn't be this hard
// 1. load cell
// 2. useEffect -> set positioning for that particular cell ...but this leads to an infinite loop
// ..note can't do it without using useEffect because then we get console error
// 
// replaced useEffect with useCallback per this article
// https://medium.com/welldone-software/usecallback-might-be-what-you-meant-by-useref-useeffect-773bc0278ae
// ..this seems to be working, but doesn't help fix the bug
// THe problem might be in Cell not CellInPlaceEditor, since it is Cell.js where the usePositioning gets the positioning values
// so in there, somehow, we want to call that usePositioning function again when there is a change
// because it must be the case that the DOM is getting updated and the node that Cell's ref is pointing to is changed by React when we add a column
//
// BUG
// Tabbing on a cell that has been edited replaces the contents of the next cell with the edited stuff from the previous cell
// ******** END OLD NOTES ******* */


const manageCellInPlaceEditorFocus = ({ event, cellInPlaceEditorRef, cell, editorKeyBindings }) => {
	ifThen({
		ifCond: manageFocus, // returns true if the focus needed to be updated
		thenDo: [
			() => cellInPlaceEditorRef.current.selectionStart = getCellPlainText(cell).length || 0,
			() => cellInPlaceEditorRef.current.selectionEnd = getCellPlainText(cell).length || 0,
			() => startedEditing({ cell }),
		],
		params: { ifParams: { event, cell, cellRef: cellInPlaceEditorRef, keyBindings: editorKeyBindings } }
	});
}

const CellInPlaceEditor = ({ cellToEdit: cell, positioning, cellHasFocus, }) => {
   // this ref is applied to the div containing the editor (see below) so that we can manage its focus
   const cellInPlaceEditorRef = useRef(); // TIDY or reinstate
	// const [cellInPlaceEditorRef, setEditorRefNode]  = useState(null);
	// const setEditorRef = useCallback(node => setEditorRefNode(node)); // TIDY or reinstate

	// getting the system clipbaord is async, and we want to re-render CellInPlaceEditor when it changes
	// so using a local state seems like a reasonable way to make it so that only the single CellInPlaceEditor changes,
	// rather than re-rendering every Cell, which would be the case if we gave systemClipboard as a param to CellInPlaceEditor
	const [systemClipboardLocal, setSystemClipboardLocal] = useState(stateSystemClipboard(managedStore.state));
	const [keystrokeHandled, setKeystrokeHandled] = useState(false); // for use by manageChange and editorKeyBindings

	const editorKeyBindings = event => {
		if (stateShowPasteOptionsModal(managedStore.state)) {
			// we're not reacting to any key strokes until the user clicks on something in the PasteOptionsModal
			runIfSomething(evt => evt.preventDefault, event);
			return;
		}
      // use https://keycode.info/ to get key values
      switch(event.keyCode) {
         case 27: // esc
            handleCancel(event);
				setKeystrokeHandled(true);
            break;

         case 13: // enter
				if (event.altKey) {
					setKeystrokeHandled(true);
					return handleAltEnter(event);
				}
				setKeystrokeHandled(true);
            handleSubmit(event);
            break;

         case 9: // tab
				setKeystrokeHandled(true);
            manageTab({ event, cell, callback: () => finalizeCellContent(cell) });
            break;

			case 66: // B for bold
				if (event.ctrlKey) {
					setKeystrokeHandled(true);
					handleStyling(event, BOLD);
				}
				break;

			case 73: // I for italic
				if (event.ctrlKey) {
					setKeystrokeHandled(true);
					handleStyling(event, UNDERLINE);
				}
				break;

			case 85: // U for underline
				if (event.ctrlKey) {
					setKeystrokeHandled(true);
					handleStyling(event, UNDERLINE);
				}
				break;

         case 67: // "C" for copy
            if (event.ctrlKey) {
					setKeystrokeHandled(true);
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
					setKeystrokeHandled(true);
					handlePaste(event);               
            }
            break;
            
         default:
      }
	};
	
   const finalizeCellContent = cell => {
		if (!R.equals(stateOriginalFormattedText(managedStore.state), cellFormattedText(cell))) {
         hasChangedCell({
            row: cellRow(cell),
            column: cellColumn(cell),
         });
      }
      finishedEditing({
			formattedText: cellFormattedText(cell),
         message: createdEditedCellMessage(cell),
			isPastingCellRange: statePastingCellRange(managedStore.state),
      });
   }

   const handleSubmit = event => {
      event?.preventDefault();
      stateFocusAbortControl(managedStore.state)?.abort();
      finalizeCellContent(cell);
      clearedFocus();
   }
   
   const handleCancel = event => {
      event?.preventDefault();
      stateFocusAbortControl(managedStore.state).abort();
      reinstateOriginalValue(cell); // note: this does the updatedCell call
      finishedEditing({
         formattedText: null, // indicates a cancel
         message: `Cancelled editing cell ${createCellId(cellRow(cell), cellColumn(cell))}`,
			actionCancelled: true,
      });
		if (!stateRangeWasCopied(managedStore.state)) {
			updateCellsInRange(false); // false means we're finding then removing all the cells from the range
		}
      clearedFocus();
   }

   const handlePaste = (arg1) => {
		console.log('*****CellInPlaceEditor--handlePaste started for cell', cell, 'with arg1:', arg1);
		if (typeof arg1 === 'function') {
			// in this case arg1 is really the event (otherwise it would be the text to paste, but we're getting that from elsewhere)
			arg1.preventDefault();
		}
		updatedHandlingPaste(true);

		const cursorStart = R.pipe(stateFocusTextSelection, R.prop('start'))(managedStore.state) || R.path(['current','selectionStart'], cellInPlaceEditorRef);
		const cursorEnd = R.pipe(stateFocusTextSelection, R.prop('end'))(managedStore.state) || R.path(['current','selectionEnd'], cellInPlaceEditorRef);
		const currentCellVersion = R.pipe(
			createCellKey,
   		cellKey => statePresent(managedStore.state)[cellKey]
		)(cellRow(cell), cellColumn(cell));

		console.log('CellInPlaceEditor--handlePaste got cursorStart', cursorStart, 'cursorEnd', cursorEnd, 'currentCellVersion', currentCellVersion);
      
      const fromCell = stateCellRangeFrom(managedStore.state);
      const toCell = stateCellRangeTo(managedStore.state);

		const doPasteRange = () => {
			const message = createPasteRangeUndoMessage({ fromCell, toCell, cell: currentCellVersion });
			startedUndoableAction({ undoableType: PASTE_RANGE, timestamp: Date.now() });
			updatedPastingCellRange(true);
			pasteCellRangeToTarget({ cell: currentCellVersion });
			updatedHandlingPaste(false);
			updatedTextSelection(null);
			manageBlur(null); // null is in place of the event, which has already had preventDefault called on it (above); 
			completedUndoableAction({ undoableType: PASTE_RANGE, message, timestamp: Date.now() });
			updatedPastingCellRange(false);
		}

		if (typeof navigator.clipboard.readText === 'function') {
			updatedCellEditorPositioning({ ...positioning }); // this is needed, in some circumstances, by PasteOptionsModal // TODO - have PostOptionsModal look at focus.cellPositioning instead
			updatedBlurEditorFunction(manageBlur); // this is needed, in some circumstances, by PasteOptionsModal
			
			navigator.clipboard.readText().then(
				systemClipboardText => {
               capturedSystemClipboard(systemClipboardText);

               if (isSomething(fromCell) && isSomething(toCell)) {
                  if (isNothing(systemClipboardText)) {
                     // we have a cell range but no clipboard so just paste the cell range
                     // this is an edge case that may never happen
                     doPasteRange();
                     return;
                  }

                  // there is a cell range and something in the clipboard, so covert the clipboard to an array of cells, then compare it to the actual cell range
                  const clipboardCellsArr = convertTextToCellRange({
                     text: systemClipboardText,
                     startingCellRowIndex: cellRow(fromCell),
                     startingCellColumnIndex: cellColumn(fromCell),
                  });

                  const storeCellsArr = stateCellRangeCells(managedStore.state);
                  if (compareCellsArrays(clipboardCellsArr, storeCellsArr)) {
                     // the system clipboard and the cell range are the same, so paste the cell range
                     doPasteRange();
                     return;
                  }
                  // system clipboard and the cell range are different, so popup dialog box asking which to use
                  updatedShowPasteOptionsModal(true);
                  return;
               }

               // there's no cell range, only something in the clipbaord
               const clipboardAsCells = convertTextToCellRange({
                  text: systemClipboardText,
                  startingCellRowIndex: cellRow(currentCellVersion),
                  startingCellColumnIndex: cellColumn(currentCellVersion),
               });
               if (clipboardAsCells.length > 1) {
                  updatedShowPasteOptionsModal(true);
                  return;
               }
					
					pasteTextIntoSingleCell({
                  text: typeof arg1 === 'string' ? arg1 : systemClipboardText,
                  cursorStart,
                  cursorEnd,
						cell: currentCellVersion,
						cellInPlaceEditorRef
               });
            }
			)
		} else {
			log({ level: LOG.WARN }, SYSTEM_CLIPBOARD_UNAVAILABLE_MSG);
			if (isSomething(fromCell) && isSomething(toCell)) {
				doPasteRange();
				return;
			}
		}
   }

	// TODO write this
	const handleAltEnter = event => {
		event?.preventDefault();
		console.log('TODO - handle alt enter');
		setKeystrokeHandled(false);
	}
	
	const updateFormattedText = ({ text, formattedText }) => {
		updatedCell({
			...cell,
			content: { 
				...cell.content, 
				text: text ? text : cell.content.text, 
				formattedText: arrayContainsSomething(formattedText?.blocks) ? formattedText : cell.content.formattedText,
			},
			isStale: true,
		});
	}

	const manageTextSelection = event => {
		if (stateIsHandlingPaste(managedStore.state)) {
			return; // don't update the text selection while we're in the middle of pasting
		}
		if (event.target.selectionStart === event.target.selectionEnd) {
			updatedTextSelection(null);
		}
		updatedTextSelection({ start: event.target.selectionStart, end: event.target.selectionEnd });
	}

	const manageChange = (event, cell) => {
		console.log('CellInPlaceEditor--manageChange started for cell', cell);
		event.preventDefault();
		if (keystrokeHandled) {
			setKeystrokeHandled(false); // reset this value
			return; // ...and do nothing else
		}

		if (isNothing(cellInPlaceEditorRef?.current)) {
			log({ level: LOG.ERROR }, 'CellInPlaceEditor--manageChange had no value for cellInPlaceEditorRef.current');
			return;
		}

		const newText = cellInPlaceEditorRef.current?.value || '';
		const formattedText = cell.content?.formattedText;
		const textSelection = stateFocusTextSelection(managedStore.state);
		const selectionStart = R.prop('start', textSelection);
		const selectionEnd = R.prop('end', textSelection);

		return isSomething(textSelection) && selectionStart !== selectionEnd
         ? R.pipe(
				R.path(['current', 'selectionStart']), 
				R.subtract(R.__, 1), 
				R.nth(R.__, newText), 
				char => pasteTextIntoSingleCell({ 
					text: char, 
					cursorStart: selectionStart, 
					cursorEnd: selectionEnd,
					cell,
					cellInPlaceEditorRef,
				})
           )(cellInPlaceEditorRef)
         : R.pipe(
              R.path(['current', 'selectionStart']),
              cursorPosition => updateEditedChar({ cursorPosition, newText, formattedText }),
              newFormattedText =>
                 updatedCell({
                    ...cell,
                    content: { ...cell.content, text: newText, formattedText: newFormattedText },
                    isStale: true,
                 })
           )(cellInPlaceEditorRef);
	}

	const handleStyling = (event, style) => {
		event?.preventDefault();
		const cursorStart = cellInPlaceEditorRef.current.selectionStart;
		const cursorEnd = cellInPlaceEditorRef.current.selectionEnd;
		const newBlocks = updateStyles({ newStyle: style, cursorStart, cursorEnd, blocks: cellFormattedTextBlocks(cell) });
		updateFormattedText({ formattedText: { blocks: newBlocks } });
	}
   
   const manageBlur = event => {
		event?.preventDefault();
		if (stateShowPasteOptionsModal(managedStore.state) || stateIsHandlingPaste(managedStore.state)) {
			//the PasteOptionsModal has popped up, so we should not blur, so the focus is retained for that modal
			return; 
		}
      R.pipe(
			stateFocusAbortControl,
			abortControl => runIfSomething(abortCtrl => abortCtrl.abort(), abortControl)
		)(managedStore.state);
      finalizeCellContent(cell);
      updatedFocusRef({ ref: null }); // clear the existing focusRef
      clearedFocus();
   }

   const renderPasteIcon = () =>
      isSomething(stateClipboard(managedStore.state)) || isSomething(systemClipboardLocal) 
		? <PasteIcon
			systemClipboard={systemClipboardLocal}
			classes="bg-white mb-1"
			svgClasses="w-6"
			onMouseDownFn={handlePaste}
		/>
      : null;

	const richTextIconStyle = 'bg-white mb-1 self-center cursor-pointer text-subdued-blue hover:text-vibrant-blue text-2xl font-bold leading-6';
	
   const renderIcons = () => {
      const leftPositioning = {
         left: positioning.width
      }

		// if there is something on the system clipboard, then that affects whether we display the PasteIcon
		getSystemClipboard()
			.then(systemClipboard => {
				ifThen({
					ifCond: isSomething,
					thenDo: setSystemClipboardLocal,
					params: { ifParams: systemClipboard, thenParams: systemClipboard }
				});
			})
			.catch(err => {
				log({ level: LOG.ERROR }, 'Couldn\'t get system clipboard', err);
			});

      return (
         <div className="relative w-full">
            <div
               className="absolute top-0 z-10 flex justify-items-start bg-white border border-grey-blue shadow-lg p-1"
               style={leftPositioning}>
					{/* onMouseDown is fired before onBlur, whereas onClick is after onBlur. 
               Since the textarea has the focus, clicking on NewDocIcon will cause
               the editor's onBlur to fire...but we need to call another action before the onBlur,
               hence the use of onMouseDown */}
					<div className="flex flex-col">
						<CheckmarkSubmitIcon classes="bg-white mb-1" svgClasses="w-6" onMouseDownFn={handleSubmit} />
						<CloseIcon classes="bg-white mb-1" svgClasses="w-6" onMouseDownFn={handleCancel} />
						{renderPasteIcon()}
						<NewDocIcon classes="mb-1" svgClasses="w-6" onMouseDownFn={() => triggerCreatedSheetAction(cell)} />
					</div>
               <div className="flex flex-col pl-2">
						<span
							className={richTextIconStyle}
							onMouseDown={event => handleStyling(event, BOLD)}>
							B
						</span>
						<span
							className={richTextIconStyle + ' italic'}
							onMouseDown={event => handleStyling(event, ITALIC)}>
							I
						</span>
						<span
							className={richTextIconStyle + ' underline'}
							onMouseDown={event => handleStyling(event, UNDERLINE)}>
							U
						</span>
					</div>
            </div>
         </div>
      );
   };

const textareaStyle = {
	height: positioning.height + CELL_EDITOR_VERTICAL_PADDING
}

const renderTextForm = () => 
	<form onSubmit={handleSubmit} >
		{renderIcons()}
		<textarea
			className="focus:outline-none border-2 border-subdued-blue p-1 shadow-lg w-full h-full" 
			ref={cellInPlaceEditorRef}
			style={textareaStyle}
			value={getCellPlainText(cell)}
			onChange={evt => manageChange(evt, cell)}
			onSelect={manageTextSelection}
			onBlur={manageBlur}
		/>
	</form>;

   // need to useEffect so the cellInPlaceEditorRef can first be assigned to the textarea
   useEffect(() => {
      if (cellHasFocus && isSomething(cellInPlaceEditorRef?.current)) {
         cellInPlaceEditorRef.current.focus();
			console.log('CellInPlaceEditor--useEffect before manageCellInPlaceEditorFocus cellInPlaceEditorRef.current.selectionStart is', cellInPlaceEditorRef.current.selectionStart, 'cellInPlaceEditorRef.current.selectionEnd', cellInPlaceEditorRef.current.selectionEnd)
         manageCellInPlaceEditorFocus({ event: null, cellInPlaceEditorRef, cell, editorKeyBindings });
			console.log('CellInPlaceEditor--useEffect after manageCellInPlaceEditorFocus cellInPlaceEditorRef.current.selectionStart is', cellInPlaceEditorRef.current.selectionStart, 'cellInPlaceEditorRef.current.selectionEnd', cellInPlaceEditorRef.current.selectionEnd)
			// updatedCellEditorPositioning({ ...positioning }); // this is needed, in some circumstances, by PasteOptionsModal // TIDY using updatedCellPositioning instead
			updatedCellPositioning(positioning);
      } // TODO can useCallback above negate the need for putting this in useEffect... If so  TIDY
   });

	const editorPositioning = {
		...positioning,
		left: positioning.left + CELL_EDITOR_HORIZONTAL_MARGIN,
		top: positioning.top - positioning.height + CELL_EDITOR_VERTICAL_MARGIN,
	}

   return (
      <div style={editorPositioning} className="absolute z-10 bg-white text-dark-dark-blue " >
         {renderTextForm()}
      </div>
   );
}

export default CellInPlaceEditor; 
