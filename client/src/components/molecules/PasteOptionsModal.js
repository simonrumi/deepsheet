import React from 'react';
import * as R from 'ramda';
import { useSelector } from 'react-redux';
import { isSomething, isNothing, optimizeModalPositioning } from '../../helpers';
import { createCellId } from '../../helpers/cellHelpers';
import { pasteCellRangeToTarget, convertTextToCellRange, pasteText } from '../../helpers/clipboardHelpers';
import {
   stateCellRangeFrom,
   stateCellRangeTo,
   cellRow,
   cellColumn,
	stateFocusCell,
	stateFocusCellRef,
   stateShowPasteOptionsModal,
	stateSystemClipboard,
	statePasteOptionsModalPositioning,
	stateBlurEditorFunction,
} from '../../helpers/dataStructureHelpers';
import { updatedPastingCellRange, replacedCellsInRange } from '../../actions/cellRangeActions';
import { updatedShowPasteOptionsModal, updatedHandlingPaste } from '../../actions/pasteOptionsModalActions';
import { PASTE_RANGE } from '../../actions/pasteOptionsModalTypes';
import { PASTE_CLIPBOARD } from '../../actions/clipboardTypes';
import { startedUndoableAction, completedUndoableAction } from '../../actions/undoActions';
import { PASTE_OPTIONS_MODAL_WIDTH, MIN_ROW_HEIGHT, PASTE_OPTIONS_MODAL_MIN_HEIGHT } from '../../constants';
import { createPasteRangeMessage, createPasteClipboardMessage } from '../displayText';
import Button from '../atoms/Button';
import CloseIcon from '../atoms/IconClose';

const PasteOptionsModal = () => {
	const showModal = useSelector(state => stateShowPasteOptionsModal(state));
	const systemClipboard = useSelector(state => stateSystemClipboard(state));
	const fromCell = useSelector(state => stateCellRangeFrom(state));
	const toCell = useSelector(state => stateCellRangeTo(state));
	const positioning = useSelector(state => statePasteOptionsModalPositioning(state)); // TODO replace this with cellPositioning in the focusReducer
	const cell = useSelector(state => stateFocusCell(state));
	const blurCellInPlaceEditor = useSelector(state => stateBlurEditorFunction(state));
	const cellInPlaceEditorRef = useSelector(state => stateFocusCellRef(state)); // TIDY

	const clipboardAsCells = isNothing(systemClipboard) ? [] : convertTextToCellRange({ 
		text: systemClipboard,
		startingCellRowIndex: cellRow(cell), 
		startingCellColumnIndex: cellColumn(cell)
	});

	if (!showModal) {
		return null;
	}

	const handlePasteClipboard = () => {
		pasteText({ text: systemClipboard });
		updatedHandlingPaste(false);
		updatedShowPasteOptionsModal(false);
	}

	const handlePasteRange = () => {
		updatedShowPasteOptionsModal(false);
		startedUndoableAction({ undoableType: PASTE_RANGE, timestamp: Date.now() });
		updatedPastingCellRange(true);
		pasteCellRangeToTarget({ cell });
		updatedHandlingPaste(false); // must do this before the blur
		blurCellInPlaceEditor();
		updatedPastingCellRange(false);
		completedUndoableAction({
			undoableType: PASTE_RANGE,
			message: createPasteRangeMessage({ cell }),
			timestamp: Date.now(),
		});
	}
	
	const handlePasteClipboardAsRange = () => {
		updatedShowPasteOptionsModal(false);
		startedUndoableAction({ undoableType: PASTE_CLIPBOARD, timestamp: Date.now() });
		updatedPastingCellRange(true);
		replacedCellsInRange(clipboardAsCells);
		pasteCellRangeToTarget({ cell, useSystemClipboard: true }) 
			? R.pipe(updatedHandlingPaste, blurCellInPlaceEditor)(false)
			// if pasteCellRangeToTarget returned false, it couldn't get a properly shaped range from the clippboard, 
			// so just paste the raw clipboard text instead, and don't blur
			: R.pipe( 
				pasteText, 
				() => updatedHandlingPaste(false)
			)({ text: systemClipboard });
		updatedPastingCellRange(false);
		completedUndoableAction({
         undoableType: PASTE_CLIPBOARD,
         message: createPasteClipboardMessage(cell),
         timestamp: Date.now(),
      });
	}

	const handlePasteClipboardAsText = () => {
		updatedShowPasteOptionsModal(false);
		startedUndoableAction({ undoableType: PASTE_CLIPBOARD, timestamp: Date.now() });
		pasteText({ text: systemClipboard });
		updatedPastingCellRange(false);
		updatedHandlingPaste(false);
		completedUndoableAction({
         undoableType: PASTE_CLIPBOARD,
         message: createPasteClipboardMessage(cell),
         timestamp: Date.now(),
      });
	}

	const handleCancelPaste = () => {
		updatedHandlingPaste(false);
		updatedShowPasteOptionsModal(false);
	}

	const modalPositioning = R.pipe(
		optimizeModalPositioning,
		R.assoc('width', PASTE_OPTIONS_MODAL_WIDTH)
	)({
		initialTop: positioning.top - MIN_ROW_HEIGHT * 2, 
		initialLeft: positioning.left + positioning.width, 
		modalWidth: PASTE_OPTIONS_MODAL_WIDTH, 
		modalHeight: PASTE_OPTIONS_MODAL_MIN_HEIGHT,
	});
	// Note: for initialTop we have positioning.height, but CellInPlaceEditor seems to get rendered twice and the 2nd time the height value is reduce (to 5px in testing)
	// the bottom value is also changed, but no other values are changed
	// Hence the height is not reliable, so using MIN_ROW_HEIGHT * 2 instead, to find a reasonable place to put this modal dialog

	const fromCellId = isSomething(fromCell) ? createCellId(cellRow(fromCell), cellColumn(fromCell)) : null;
	const toCellId = isSomething(toCell) ? createCellId(cellRow(toCell), cellColumn(toCell)) : null;
	const closeButton = (
		<div className="flex justify-end">
			<CloseIcon classes="p-1" svgClasses="w-6" onClickFn={handleCancelPaste}/>
		</div>
	)

	return clipboardAsCells.length > 1 && isNothing(toCell)
		? (
			<div className="relative w-full z-50">
				<div className="absolute top-0 bg-white border border-grey-blue shadow-lg p-1" style={modalPositioning}>
					{closeButton}
					<div className="flex justify-center">
						<Button label="Paste clipboard as range of cells" classes="p-3" onClickFn={handlePasteClipboardAsRange}/>
						<Button label="Paste clipboard in one cell" classes="p-3" onClickFn={handlePasteClipboardAsText}/>
					</div>
				</div>
			</div>
		)
		: clipboardAsCells.length > 1 && isSomething(toCell) 
			? (
				<div className="relative w-full z-50">
					<div className="absolute top-0 bg-white border border-grey-blue shadow-lg p-1" style={modalPositioning}>
						{closeButton}
						<div className="grid grid-cols-3">
							<Button label="Paste cell range" classes="p-1" onClickFn={handlePasteRange}/>
							<Button label="Paste clipboard as range of cells" classes="p-1" onClickFn={handlePasteClipboardAsRange}/>
							<Button label="Paste clipboard in one cell" classes="p-1" onClickFn={handlePasteClipboardAsText}/>
						</div>
						<p>You can paste the cell range from 
							<span className="text-vibrant-purple"> {fromCellId} </span>
							to 
							<span className="text-vibrant-purple"> {toCellId} </span>
						</p>
						<p>Or paste the system clipboard as either a range of cells, or paste it into a single cell. The system clipboard contains this:</p>
						<p>"<span className="text-vibrant-purple">{systemClipboard}</span>"</p>
					</div>
				</div>
			)
			: (
				<div className="relative w-full z-50">
					<div className="absolute top-0 bg-white border border-grey-blue shadow-lg p-1" style={modalPositioning}>
						{closeButton}
						<div className="flex justify-center">
							<Button label="Paste cell range" classes="p-3" onClickFn={handlePasteRange}/>
							<Button label="Paste clipboard" classes="p-3" onClickFn={handlePasteClipboard}/>
						</div>
						<p>You can either paste the cell range from 
							<span className="text-vibrant-purple"> {fromCellId} </span>
							to 
							<span className="text-vibrant-purple"> {toCellId} </span>
						</p>
						<p>Or the system clipboard, which contains this:</p>
						<p>"<span className="text-vibrant-purple">{systemClipboard}</span>"</p>
					</div>
				</div>
		);
}

export default PasteOptionsModal;