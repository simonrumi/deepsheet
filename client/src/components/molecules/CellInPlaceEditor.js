import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as R from 'ramda';
import managedStore from '../../store';
import { updatedCell, hasChangedCell } from '../../actions/cellActions';
import { updatedFloatingCell } from '../../actions/floatingCellActions';
import {
   clearedFocus,
   updatedFocusRef,
   updatedTextSelection,
	clickedEditorHeader,
	releasedEditorHeader,
	updatedEditorPositioning,
} from '../../actions/focusActions';
import { updatedPastingCellRange } from '../../actions/cellRangeActions';
import { startedEditing, finishedEditing, startedUndoableAction, completedUndoableAction, } from '../../actions/undoActions';
import { PASTE_RANGE, } from '../../actions/cellRangeTypes';
import { updatedClipboard } from '../../actions/clipboardActions';
import {
   capturedSystemClipboard,
   updatedShowPasteOptionsModal,
	updatedBlurEditorFunction,
	updatedHandlingPaste,
} from '../../actions/pasteOptionsModalActions';
import {
   isNothing,
   isSomething,
   arrayContainsSomething,
   ifThen,
   runIfSomething,
} from '../../helpers';
import { manageFocus, manageTab } from '../../helpers/focusHelpers';
import { updateEditedChar, getCellPlainText } from '../../helpers/richTextHelpers';
import { updateStyles } from '../../helpers/richTextStyleRangeHelpers';
import {
   pasteCellRangeToTarget,
   updateSystemClipboard,
   convertTextToCellRange,
	pasteTextIntoSingleCell,
} from '../../helpers/clipboardHelpers';
import { compareCellsArrays, updateCellsInRange } from '../../helpers/rangeToolHelpers';
import { createCellKey, } from '../../helpers/cellHelpers';
import { createFloatingCellKey, isFloatingCellTest } from '../../helpers/floatingCellHelpers';
import {
	statePresent,
   stateCell,
   cellRow,
   cellColumn,
	cellFormattedText,
	cellFormattedTextBlocks,
	stateFloatingCell,
	floatingCellNumber,
	stateOriginalFormattedText,
   stateOriginalRow,
   stateOriginalColumn,
	stateOriginalNumber,
   stateFocusAbortControl,
	stateFocusTextSelection,
	stateFocusClickedEditorHeader,
   stateCellRangeFrom,
   stateCellRangeTo,
   stateCellRangeCells,
	stateRangeWasCopied,
	statePastingCellRange,
	stateShowPasteOptionsModal,
	stateIsHandlingPaste,
} from '../../helpers/dataStructureHelpers';
import { useEditorPositioning } from '../../helpers/hooks';
import { createPasteRangeUndoMessage, createCancelledEditingCellMessage } from '../displayText';
import MoveIcon from '../atoms/IconMove';
import {
   LOG,
	BOLD,
	ITALIC,
	UNDERLINE,
	CELL_EDITOR_LINE_HEIGHT,
} from '../../constants';
import { SYSTEM_CLIPBOARD_UNAVAILABLE_MSG, createdEditedCellMessage } from '../displayText';
import DraggableElement from '../atoms/DraggableElement';
import { log } from '../../clientLogger';
import CellEditorTools from './CellEditorTools';

const reinstateOriginalValue = cell => {
	const originalCell = {
		...cell,
		content: {
			...cell.content,
			formattedText: stateOriginalFormattedText(managedStore.state),
		},
		isStale: false,
	};
	
	const condition = isFloatingCellTest(cell)
		? floatingCellNumber(cell) === stateOriginalNumber(managedStore.state)
		: cellRow(cell) === stateOriginalRow(managedStore.state) && cellColumn(cell) === stateOriginalColumn(managedStore.state);
	const updateFn = isFloatingCellTest(cell) ? updatedFloatingCell : updatedCell;
	ifThen({
      ifCond: condition,
      thenDo: updateFn,
      params: { thenParams: originalCell },
   });
}

const manageCellInPlaceEditorFocus = ({ event, editorRef, cell, editorKeyBindings }) => {
	const changedFocus = manageFocus({ event, cell, cellRef: editorRef, keyBindings: editorKeyBindings });
	ifThen({
		ifCond: changedFocus,
		thenDo: [
			() => editorRef.current.selectionStart = getCellPlainText(cell).length || 0,
			() => editorRef.current.selectionEnd = getCellPlainText(cell).length || 0,
			() => startedEditing({ cell }),
		],
		params: {}
	});
	return changedFocus; // no one is using this value, but can't hurt
}

const cellFromStore = cell => {
	if (isSomething(floatingCellNumber(cell))) {
		return R.pipe(
			floatingCellNumber,
			createFloatingCellKey,
			floatingCellKey => statePresent(managedStore.state)[floatingCellKey]
		)(cell);
	}
	return R.pipe(
		createCellKey,
		cellKey => statePresent(managedStore.state)[cellKey]
	)(cellRow(cell), cellColumn(cell));
}

const CellInPlaceEditor = ({ cellToEdit: cell, cellPositioning, cellHasFocus }) => {
	log({ level: LOG.DEBUG }, '\n***CellInPlaceEditor started for cell', cell);
	const [editorRef, editorPositioning, setEditorPositioning] = useEditorPositioning({ cellPositioning, cell }); // editorRef is applied to the div containing the editor (see below) so that we can manage its focus
	const [keystrokeHandled, setKeystrokeHandled] = useState(false); // for use by manageChange and editorKeyBindings
	const isFloatingCell = isFloatingCellTest(cell);
	const editorId = useMemo(
		() => isFloatingCell 
			? R.pipe(floatingCellNumber, createFloatingCellKey, R.concat('editor_'))(cell)
			: R.pipe(createCellKey, R.concat('editor_'))(cellRow(cell), cellColumn(cell)),
		[cell, isFloatingCell]
	);

	const generateMemoizedFns = useCallback(
		() => {
			const finalizeCellContent = cell => {
				const cellWithLatestFormattedText = cellFromStore(cell);
				const latestFormattedText = cellFormattedText(cellWithLatestFormattedText);

				if (!R.equals(stateOriginalFormattedText(managedStore.state), latestFormattedText)) {
					if (isFloatingCell) {
						updatedFloatingCell(cellWithLatestFormattedText);
					}
					if (isSomething(cellRow(cell))) {
						// for a regular cell only
						hasChangedCell({
							row: cellRow(cell),
							column: cellColumn(cell),
						});
					}
				}
				finishedEditing({
					formattedText: latestFormattedText,
					message: createdEditedCellMessage(cell),
					isPastingCellRange: statePastingCellRange(managedStore.state),
				});
			}

			const handleSubmit = event => {
				event?.preventDefault();
				stateFocusAbortControl(managedStore.state)?.abort();
				finalizeCellContent(cell);
				clearedFocus();
			};

			const handleCancel = event => {
				event?.preventDefault();
				stateFocusAbortControl(managedStore.state).abort();
				reinstateOriginalValue(cell); // note: this does the updatedCell call
				finishedEditing({
					formattedText: null, // indicates a cancel
					message: createCancelledEditingCellMessage(cell),
					actionCancelled: true,
				});
				if (!stateRangeWasCopied(managedStore.state)) {
					updateCellsInRange(false); // false means we're finding then removing all the cells from the range
				}
				clearedFocus();
			}

			const manageBlur = event => {
				event?.preventDefault();
				if (
					stateShowPasteOptionsModal(managedStore.state) || //the PasteOptionsModal has popped up, or
					stateIsHandlingPaste(managedStore.state) || // we're in the middle of pasting, or
					stateFocusClickedEditorHeader(managedStore.state) // the header was clicked (and maybe dragged), so...
				) {
					// ...we should not blur
					return;
				}
				R.pipe(
					stateFocusAbortControl,
					abortControl => runIfSomething(abortCtrl => abortCtrl.abort(), abortControl)
				)(managedStore.state);
				finalizeCellContent(cell);
				updatedFocusRef(null); // clear the existing focusRef
				clearedFocus();
			}

			const handlePaste = arg1 => {
				if (typeof arg1 === 'function') {
					// in this case arg1 is really the event (otherwise it would be the text to paste, but we're getting that from elsewhere)
					arg1.preventDefault();
				}
				updatedHandlingPaste(true);
	
				const cursorStart = R.pipe(stateFocusTextSelection, R.prop('start'))(managedStore.state) || R.path(['current','selectionStart'], editorRef);
				const cursorEnd = R.pipe(stateFocusTextSelection, R.prop('end'))(managedStore.state) || R.path(['current','selectionEnd'], editorRef);
				const currentCellVersion = cellFromStore(cell);
				
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
					updatedBlurEditorFunction(manageBlur); // this is needed, in some circumstances, by PasteOptionsModal
					updatedEditorPositioning(editorPositioning); // also needed by PasteOptionsModal
					
					navigator.clipboard.readText().then(
						systemClipboardText => {
							capturedSystemClipboard(systemClipboardText);
							
							if (isNothing(floatingCellNumber(cell))) {
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
							}

							// EITHER we're dealing with a floating cell OR there's no cell range, and the clipboard is not a cell range 
							// ...this is the default thing to do:
							pasteTextIntoSingleCell({
								text: typeof arg1 === 'string' ? arg1 : systemClipboardText,
								cursorStart,
								cursorEnd,
								cell: currentCellVersion,
								editorRef
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

			const manageChange = (event, isAltEnter = false) => {
				event.preventDefault();

				if (keystrokeHandled) {
					setKeystrokeHandled(false); // reset this value
					return; // ...and do nothing else
				}
	
				if (isNothing(editorRef?.current)) {
					log({ level: LOG.ERROR }, 'CellInPlaceEditor--manageChange had no value for editorRef.current');
					setKeystrokeHandled(false); // reset this value
					return;
				}
				
				const newText = editorRef.current?.value || '';
				const currentCellVersion = cellFromStore(cell);
				const formattedText = cellFormattedText(currentCellVersion);
				const textSelection = stateFocusTextSelection(managedStore.state);
				const selectionStart = R.prop('start', textSelection);
				const selectionEnd = R.prop('end', textSelection);
	
				if (isSomething(textSelection) && selectionStart !== selectionEnd) {
					return R.pipe(
						R.path(['current', 'selectionStart']), 
						R.subtract(R.__, 1), 
						R.nth(R.__, newText), 
						char => pasteTextIntoSingleCell({ 
							text: char, 
							cursorStart: selectionStart, 
							cursorEnd: selectionEnd,
							cell,
							editorRef,
						})
					)(editorRef);
				}
				const { formattedText: newFormattedText, cursorPosition } = updateEditedChar({ cursorPosition: selectionStart, newText, formattedText, isNewline: isAltEnter });
				if (isSomething(cellRow(cell))) {
					// we have a regular cell
					updatedCell({
						...currentCellVersion,
						content: { ...currentCellVersion.content, text: newText, formattedText: newFormattedText },
						isStale: true,
					});
				}
				if (isFloatingCell) {
					// we have a floating cell
					updatedFloatingCell({
						...currentCellVersion,
						content: { ...currentCellVersion.content, text: newText, formattedText: newFormattedText },
						isStale: true,
					});
				}
				
				event.target.selectionStart = cursorPosition;
				event.target.selectionEnd = cursorPosition;
				updatedTextSelection({ start: cursorPosition, end:cursorPosition });
				setKeystrokeHandled(false);
			}

			const handleStyling = (event, style) => {
				event?.preventDefault();
				const cursorStart = editorRef.current.selectionStart;
				const cursorEnd = editorRef.current.selectionEnd;
				const newFormattedText = {
					blocks: updateStyles({
						newStyle: style,
						cursorStart,
						cursorEnd,
						blocks: R.pipe(cellFromStore, cellFormattedTextBlocks)(cell),
					})
				}
				const newCell = {
					...cell,
					content: { 
						...cell.content, 
						formattedText: arrayContainsSomething(newFormattedText?.blocks) ? newFormattedText : cell.content.formattedText,
					},
					isStale: true,
				}
				isFloatingCell ? updatedFloatingCell(newCell) : updatedCell(newCell);
			}

			const editorKeyBindings =  event => {
				if (stateShowPasteOptionsModal(managedStore.state)) {
					// we're not reacting to any key strokes until the user clicks on something in the PasteOptionsModal
					runIfSomething(evt => evt.preventDefault, event);
					return;
				}
				// use https://keycode.info/ to get key values
				switch(event.keyCode) {
					case 27: // esc
						setKeystrokeHandled(true);
						handleCancel(event);
						break;
	
					case 13: // enter
						if (event.altKey) {
							setKeystrokeHandled(true);
							manageChange(event, true);
							break;
						}
						setKeystrokeHandled(true);
						handleSubmit(event);
						break;
	
					case 9: // tab
						setKeystrokeHandled(true);
						manageTab({ event, cell, callback: () => finalizeCellContent(cell), goBackwards: event.shiftKey });
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
							handleStyling(event, ITALIC);
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
							const text = isFloatingCellTest(cell) 
								? R.pipe(
									floatingCellNumber,
									createFloatingCellKey,
									stateFloatingCell(managedStore.state),
									getCellPlainText,
								)(cell)
								: R.pipe(
									createCellKey,
									stateCell(managedStore.state),
									getCellPlainText,
								)(cellRow(cell), cellColumn(cell));
							const selectedText = R.pipe(
								stateFocusTextSelection,
								selection => R.slice(selection.start, selection.end, text),
							)(managedStore.state);
							updatedClipboard({ selectedText });
							updateSystemClipboard(selectedText);
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

			return { handleSubmit, handleCancel, manageBlur, handlePaste, manageChange, handleStyling, editorKeyBindings, manageTextSelection };
		},
		[cell, editorPositioning, keystrokeHandled, editorRef, isFloatingCell]
	);
	const { handleSubmit, handleCancel, manageBlur, handlePaste, manageChange, handleStyling, editorKeyBindings, manageTextSelection } = generateMemoizedFns();

	const textareaStyle = useMemo(
		() => {
			const height = R.prop('height', editorPositioning) || CELL_EDITOR_LINE_HEIGHT;
			const biggestHeight = R.gt(height, CELL_EDITOR_LINE_HEIGHT) ? height : CELL_EDITOR_LINE_HEIGHT;
			return { height: biggestHeight };
		},
		[editorPositioning]
	);

	const renderTextForm = useCallback(
		() => {
			return (
				<form onSubmit={handleSubmit}>
					<CellEditorTools
						handleSubmit={handleSubmit}
						handleCancel={handleCancel}
						handleStyling={handleStyling}
						handlePaste={handlePaste}
						cell={cell}
						editorPositioning={editorPositioning}
						setEditorPositioning={setEditorPositioning}
						editorRef={editorRef}
					/>
					<textarea
						className="focus:outline-none border-2 border-subdued-blue p-1 shadow-lg absolute z-20"
						ref={editorRef}
						style={textareaStyle}
						value={getCellPlainText(cell)}
						onChange={manageChange}
						onSelect={manageTextSelection}
						onBlur={manageBlur}
					/>
				</form>
			);
		},
		[editorPositioning, cell, editorRef, textareaStyle, handleCancel, handlePaste, handleStyling, handleSubmit, manageChange, manageBlur, manageTextSelection, setEditorPositioning]
	);

   // need to useEffect so the editorRef can first be assigned to the textarea
   useEffect(
		() => {
			if (cellHasFocus && isSomething(editorRef?.current)) {
				editorRef.current.focus();
				manageCellInPlaceEditorFocus({ event: null, editorRef, cell, editorKeyBindings });
			}
   	},
		[cellHasFocus, editorRef, cell, editorKeyBindings]
	);

   return (
		<DraggableElement classes="absolute z-20 text-dark-dark-blue flex items-start" positioning={editorPositioning} showBorder={false} id={editorId}>
			<MoveIcon classes="bg-white mr-1 w-6" onMouseDownFn={clickedEditorHeader} onMouseUpFn={releasedEditorHeader} />
			{renderTextForm()}
		</DraggableElement>
   );
}

export default CellInPlaceEditor; 
