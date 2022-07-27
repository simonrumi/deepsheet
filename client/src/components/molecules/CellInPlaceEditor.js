import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import * as R from 'ramda';
import {
   Editor,
   RichUtils,
   convertToRaw,
   getDefaultKeyBinding,
} from 'draft-js';
import 'draft-js/dist/Draft.css';
import managedStore from '../../store';
import { updatedCell, hasChangedCell } from '../../actions/cellActions';
import { createdSheet } from '../../actions/sheetActions';
import { clearedFocus, updatedFocusRef, updatedEditorState, updatedCellPositioning } from '../../actions/focusActions';
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
import {
   pasteCellRangeToTarget,
   updateSystemClipboard,
   convertTextToCellRange,
	pasteText,
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
   stateOriginalValue,
	stateOriginaFormattedText,
   stateOriginalRow,
   stateOriginalColumn,
	stateFocus,
   stateFocusAbortControl,
	stateFocusEditor,
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
	CELL_EDITOR_ESC,
	CELL_EDITOR_ENTER,
	CELL_EDITOR_ALT_ENTER,
	CELL_EDITOR_TAB,
	CELL_EDITOR_SHIFT_TAB,
	CELL_EDITOR_COPY,
	CELL_EDITOR_PASTE,
	CELL_EDITOR_KEY_COMMAND_HANDLED,
	CELL_EDITOR_KEY_COMMAND_NOT_HANDLED,
} from '../../constants';
import { SYSTEM_CLIPBOARD_UNAVAILABLE_MSG, createdEditedCellMessage } from '../displayText';
import { log } from '../../clientLogger';

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
					text: stateOriginalValue(managedStore.state),
					formattedText: stateOriginaFormattedText(managedStore.state),
				},
				isStale: false,
			},
		},
	});

// ******** OLD NOTES *******
// 1. add a column
// 2. click on a cell
// result: the cell editor is shown in the wrong place
//
// This might be to do with the usePositioning hook. It uses useCallback which returns a memoized callback
// ... look at console logs - when clicking on a cell node is null
// see this article - probably need to update the ref stuff as he says:
// https://medium.com/welldone-software/usecallback-might-be-what-you-meant-by-useref-useeffect-773bc0278ae
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
// ******** END OLD NOTES *******

/**
 * branches:
 * master - no DraftJs
 * development = has DraftJs, working, except that adding columns messes up the node structure and can't seem to fix that
 * removingDraftJS = this branch
 * sansDraftJs = no DraftJs, just like master, saved just in case - swap back to this branch instead of master for seeing old setup
 * updatePackages = old branch, should delete
 * 
 * TODO NEXT
 * remove <Editor>, 
 * ...need to see what renderTextForm looked like in the sansDraftJs branch
 * THEN 
 * reinstate old methods of editing text, but use the data structure from DraftJs
 */

/* test data: TIDY
some	thing
too	do
here	now
NEW
STUFF
HERE
*/

const CellInPlaceEditor = ({ cellToEdit, positioning, cellHasFocus, }) => {
   // this ref is applied to the div containing the editor (see below) so that we can manage its focus
   // const cellInPlaceEditorRef = useRef(); // TIDY or reinstate
	const [cellInPlaceEditorRef, setEditorRefNode]  = useState(null);
	const setEditorRef = useCallback(node => setEditorRefNode(node));
	console.log('CellInPlaceEditor got cellInPlaceEditorRef', cellInPlaceEditorRef);

	if (cellHasFocus && isSomething(cellInPlaceEditorRef?.current)) {
		cellInPlaceEditorRef.current.focus();
		manageCellInPlaceEditorFocus(null);
		// updatedCellEditorPositioning({ ...positioning }); // this is needed, in some circumstances, by PasteOptionsModal // TIDY using updatedCellPositioning instead
		updatedCellPositioning(positioning);
	}

	const cellKey = createCellKey(cellRow(cellToEdit), cellColumn(cellToEdit));
   const cell = useSelector(state => statePresent(state)[cellKey]);
	const editorState = useSelector(state => stateFocusEditor(state));

	// getting the system clipbaord is async, and we want to re-render CellInPlaceEditor when it changes
	// so using a local state seems like a reasonable way to make it so that only the single CellInPlaceEditor changes,
	// rather than re-rendering every Cell, which would be the case if we gave systemClipboard as a param to CellInPlaceEditor
	const [systemClipboardLocal, setSystemClipboardLocal] = useState(stateSystemClipboard(managedStore.state));
	
   const finalizeCellContent = cell => {
      if (!R.equals(stateOriginalValue(managedStore.state), cellInPlaceEditorRef.current?.value)) {
         hasChangedCell({
            row: cellRow(cell),
            column: cellColumn(cell),
         });
      }
      finishedEditing({
         value: isSomething(cellInPlaceEditorRef.current) ? cellInPlaceEditorRef.current.value : null,
         message: createdEditedCellMessage(cell),
			isPastingCellRange: statePastingCellRange(managedStore.state),
      });
   }

   const handleSubmit = event => {
      event?.preventDefault();
		editorChangeHandler(editorState); // this ensures we get the latest change updated into the redux store
      stateFocusAbortControl(managedStore.state)?.abort();
      finalizeCellContent(cell);
      clearedFocus();
   }
   
   const handleCancel = event => {
      event?.preventDefault(); //TIDy if not needed
      stateFocusAbortControl(managedStore.state).abort();
      reinstateOriginalValue(cell); // note: this does the updatedCell call
      finishedEditing({
         value: isSomething(cellInPlaceEditorRef.current) ? cellInPlaceEditorRef.current.value : null,
         message: `Cancelled editing cell ${createCellId(cellRow(cell), cellColumn(cell))}`,
			actionCancelled: true,
      });
		if (!stateRangeWasCopied(managedStore.state)) {
			updateCellsInRange(false); // false means we're finding then removing all the cells from the range
		}
      clearedFocus();
   }

   const handlePaste = (arg1, styles, prePasteEditorState) => {
		if (typeof arg1 === 'function') {
			// in this case arg1 is really the event (otherwise it would be the text to paste, but we're getting that from elsewhere)
			arg1.preventDefault();
		}
		updatedHandlingPaste(true);
      
      const fromCell = stateCellRangeFrom(managedStore.state);
      const toCell = stateCellRangeTo(managedStore.state);

		const doPasteRange = () => {
			const message = createPasteRangeUndoMessage({ fromCell, toCell, cell });
			startedUndoableAction({ undoableType: PASTE_RANGE, timestamp: Date.now() });
			updatedPastingCellRange(true);
			pasteCellRangeToTarget({ cell });
			updatedHandlingPaste(false);
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
                  startingCellRowIndex: cellRow(cell),
                  startingCellColumnIndex: cellColumn(cell),
               });
               if (clipboardAsCells.length > 1) {
                  updatedShowPasteOptionsModal(true);
                  return;
               }
					// note - this fn will call updatedHandlingPaste(false)
               pasteText({ text: typeof arg1 === 'string' ? arg1 : systemClipboardText }); 
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

	const updateReduxStore = ({ text, formattedText }) => {
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

	const editorChangeHandler = newState => {
		updatedEditorState(newState);
		const newText = editorState.getCurrentContent().getPlainText();
		const rawState = convertToRaw(editorState.getCurrentContent());
		const text = editorState.getCurrentContent().getPlainText();
		updateReduxStore({ text: newText, formattedText: rawState });
	}

	const handleStyling = (event, style) => {
		event?.preventDefault();
		const newState = RichUtils.toggleInlineStyle(editorState, style);
		updatedEditorState(newState);
		const rawState = convertToRaw(editorState.getCurrentContent());
		updateReduxStore({ formattedText: rawState });
	}

	const setKeyBindingCodes = event => {
		switch(event.keyCode) {
			case 27: // esc
            return CELL_EDITOR_ESC;

         case 13: // enter
				if (event.altKey) {
					return CELL_EDITOR_ALT_ENTER;
				}
				return CELL_EDITOR_ENTER;

         case 9: // tab
				if (event.shiftKey) {
					return CELL_EDITOR_SHIFT_TAB;
				}
            return CELL_EDITOR_TAB;

         case 67: // "C" for copy
            if (event.ctrlKey) {
               return CELL_EDITOR_COPY;
            }
            break;

         case 86: // "V" for paste 
            if (event.ctrlKey) {
					return CELL_EDITOR_PASTE;               
            } 
            break;

			default:
				return getDefaultKeyBinding(event);
		}
	}

   const keyBindingsCellInPlaceEditor = (command, editorState) => {
		if (stateShowPasteOptionsModal(managedStore.state)) {
			// we're not reacting to any key strokes until the user clicks on something in the PasteOptionsModal
			return CELL_EDITOR_KEY_COMMAND_NOT_HANDLED; // TODO test this and check this is the right thing to do here
		}

      // use https://keycode.info/ to get key values
      switch(command) {
         case CELL_EDITOR_ESC:
            handleCancel();
            return CELL_EDITOR_KEY_COMMAND_HANDLED;

         case CELL_EDITOR_ENTER:
				handleSubmit();
            return CELL_EDITOR_KEY_COMMAND_HANDLED;

         case CELL_EDITOR_TAB:
            manageTab({ cell, 
					callback: () => {
						editorChangeHandler(editorState);
						finalizeCellContent(cell);
					}, 
					goBackwards: false 
				});
            return CELL_EDITOR_KEY_COMMAND_HANDLED;

			case CELL_EDITOR_SHIFT_TAB:
				manageTab({ 
					cell, 
					callback: () => { 
						editorChangeHandler(editorState);
						finalizeCellContent(cell) 
					}, 
					goBackwards: true 
				});
            return CELL_EDITOR_KEY_COMMAND_HANDLED;

         case CELL_EDITOR_COPY:
				const text = R.pipe(
					createCellKey,
					stateCell(managedStore.state),
					cellText
				)(cellRow(cell), cellColumn(cell));
				updatedClipboard({ text });
				updateSystemClipboard(text);
            return CELL_EDITOR_KEY_COMMAND_HANDLED;

         case CELL_EDITOR_PASTE:
				handlePaste();
            return CELL_EDITOR_KEY_COMMAND_HANDLED;

			case CELL_EDITOR_ALT_ENTER:
         default:
				const newState = RichUtils.handleKeyCommand(editorState, command);
				if (isSomething(newState)) {
					editorChangeHandler(newState);
					return CELL_EDITOR_KEY_COMMAND_HANDLED;
				}
				return CELL_EDITOR_KEY_COMMAND_NOT_HANDLED;
      }
   };
   
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

   const manageCellInPlaceEditorFocus = event => {
		console.log('CellInPlaceEditor--manageCellInPlaceEditorFocus, cellInPlaceEditorRef', cellInPlaceEditorRef);
      ifThen({
         ifCond: manageFocus, // returns true if the focus needed to be updated
         thenDo: () => startedEditing({ cell, editorState }),
         params: { ifParams: { event, cell, cellRef: cellInPlaceEditorRef } }
      });
   }

   const renderPasteIcon = () =>
      isSomething(stateClipboard(managedStore.state)) || isSomething(systemClipboardLocal) ? (
         <PasteIcon
            systemClipboard={systemClipboardLocal}
            classes="bg-white mb-1"
            svgClasses="w-6"
            onMouseDownFn={handlePaste}
         />
      ) : null;

	const richTextIconStyle = 'bg-white mb-1 self-center cursor-pointer text-subdued-blue hover:text-vibrant-blue text-2xl font-bold leading-6';
	
   const renderIcons = () => {
      const leftPositioning = {
         left: positioning.width
      }

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

const renderTextForm = () => <form onSubmit={handleSubmit}>
	{renderIcons()}
	<div
		className="focus:outline-none border-2 border-subdued-blue p-1 shadow-lg bg-white w-full h-full"
		onBlur={manageBlur}
		>
		{ isSomething(editorState)
			? <Editor
				editorState={editorState}
				onChange={editorChangeHandler}
				handleKeyCommand={keyBindingsCellInPlaceEditor } 
				keyBindingFn={setKeyBindingCodes}
				handlePastedText={handlePaste}
				ref={setEditorRef}
			/> // used to be ref={cellInPlaceEditorRef} // TIDY
			: null
		}
	</div>
</form>

   // need to useEffect so the cellInPlaceEditorRef can first be assigned to the textarea
   useEffect(() => {
      /* if (cellHasFocus && isSomething(cellInPlaceEditorRef?.current)) {
         cellInPlaceEditorRef.current.focus();
         manageCellInPlaceEditorFocus(null);
			// updatedCellEditorPositioning({ ...positioning }); // this is needed, in some circumstances, by PasteOptionsModal // TIDY using updatedCellPositioning instead
			updatedCellPositioning(positioning);
      } */ // TODO reinstate this if we need it here...but really we can this code outside of useEffect since we're using useCallback above, so TIDY

		// if there is something on the system clipboard, then that affects whether we display the PasteIcon
		getSystemClipboard()
			.then( systemClipboard => {
				ifThen({
					ifCond: isSomething,
					thenDo: setSystemClipboardLocal,
					params: { ifParams: systemClipboard, thenParams: systemClipboard }
				});
			})
			.catch(err => {
				log({ level: LOG.ERROR }, 'Couldn\'t get system clipboard', err);
			});
   });

   return (
      <div style={positioning} className="absolute z-10 bg-white text-dark-dark-blue " >
         {renderTextForm()}
      </div>
   );
}

export default CellInPlaceEditor; 
