import React from 'react';
import * as R from 'ramda';
import { useSelector } from 'react-redux';
import { isSomething, isNothing, ifThenElse, optimizeModalPositioning } from '../../helpers';
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
import { updatedCell } from '../../actions/cellActions';
import { updatedPastingCellRange, replacedCellsInRange, clearedCellRange } from '../../actions/cellRangeActions';
import { updatedShowPasteOptionsModal } from '../../actions/pasteOptionsModalActions';
import { PASTE_RANGE } from '../../actions/pasteOptionsModalTypes';
import { PASTE_CLIPBOARD } from '../../actions/clipboardTypes';
import { startedUndoableAction, completedUndoableAction } from '../../actions/undoActions';
import { PASTE_OPTIONS_MODAL_WIDTH, MIN_ROW_HEIGHT, PASTE_OPTIONS_MODAL_MIN_HEIGHT } from '../../constants';
import { createPasteRangeMessage, createPasteClipboardMessage } from '../displayText';
import Button from '../atoms/Button';

// TODO BUG
// 1. copy range
// 2. copy text range (below)
// 3. paste ....post options modal shows up
// 4. click "paste clipboard as range"
// result the clipboard is pasted both as a range and as text 

/*
A1	A3
B2	B3
*/

const PasteOptionsModal = () => {
	const showModal = useSelector(state => stateShowPasteOptionsModal(state));
	const systemClipboard = useSelector(state => stateSystemClipboard(state));
	const fromCell = useSelector(state => stateCellRangeFrom(state));
	const toCell = useSelector(state => stateCellRangeTo(state));
	const positioning = useSelector(state => statePasteOptionsModalPositioning(state));
	const cell = useSelector(state => stateFocusCell(state));
	const blurCellInPlaceEditor = useSelector(state => stateBlurEditorFunction(state));
	const cellInPlaceEditorRef = useSelector(state => stateFocusCellRef(state));

	const clipboardAsCells = isNothing(systemClipboard) ? [] : convertTextToCellRange({ 
		text: systemClipboard,
		startingCellRowIndex: cellRow(cell), 
		startingCellColumnIndex: cellColumn(cell)
	});

	if (!showModal) {
		return null;
	}

	const handlePasteClipboard = () => {
		console.log('PasteOptionsModal--handlePasteClipboard started');
		if (clipboardAsCells.length > 1) {
			startedUndoableAction({ undoableType: PASTE_CLIPBOARD, timestamp: Date.now() });
			updatedPastingCellRange(true);
			clearedCellRange(); // clears from, to, and cells
			replacedCellsInRange(clipboardAsCells);
			ifThenElse({
				ifCond: pasteCellRangeToTarget, // if true, a correctly formed range was pasted
				thenDo: [ updatedShowPasteOptionsModal, blurCellInPlaceEditor, () => console.log('PasteOptionsModal--handlePasteClipboard successful pasteCellRangeToTarget') ], // note: must happen in this order
				elseDo: [ pasteText, () => console.log('PasteOptionsModal--handlePasteClipboard unsuccessful pasteCellRangeToTarget so did pasteText') ], // just paste the raw clipboard text instead and don't blur  /// TIDY
				params: { ifParams: cell, thenParams: false, elseParams: { text: systemClipboard, cell, cellInPlaceEditorRef } }
			});
			const message = createPasteClipboardMessage(cell);
			completedUndoableAction({ undoableType: PASTE_CLIPBOARD, message, timestamp: Date.now() });
			updatedPastingCellRange(false); // TODO move this to before completedUndoableAction
		}

		updatedCell({
			...cell,
			content: { ...cell.content, text: systemClipboard },
			isStale: true,
		});
		updatedShowPasteOptionsModal(false);
	}

	const handlePasteRange = () => {
		updatedShowPasteOptionsModal(false);
		startedUndoableAction({ undoableType: PASTE_RANGE, timestamp: Date.now() });
		updatedPastingCellRange(true);
		pasteCellRangeToTarget(cell);
		blurCellInPlaceEditor();  
		completedUndoableAction({
			undoableType: PASTE_RANGE,
			message: createPasteRangeMessage({ cell }),
			timestamp: Date.now(),
		});
		updatedPastingCellRange(false); // TODO move this to before completedUndoableAction
	}

	const handlePasteClipboardAsRange = () => {
		updatedShowPasteOptionsModal(false);
		startedUndoableAction({ undoableType: PASTE_CLIPBOARD, timestamp: Date.now() });
		updatedPastingCellRange(true);
		replacedCellsInRange(clipboardAsCells);
		if(pasteCellRangeToTarget(cell)) {
			console.log('PasteOptionsModal--handlePasteClipboardAsRange pasteCellRangeToTarget returned true, now blurring');
			blurCellInPlaceEditor() // pasteCellRangeToTarget returned true, indicating a correctly formed range was pasted, so now do the blur
		} else {
			console.log('PasteOptionsModal--handlePasteClipboardAsRange pasteCellRangeToTarget returned false, so now doing pasteText');
			pasteText({ text: systemClipboard, cell, cellInPlaceEditorRef }); // pasteCellRangeToTarget returned false, indicating it couldn't get a properly shaped range from the clippboard, so just paste the raw clipboard text instead, and don't blur
		}// TIDY - make into ?-: thing or use ifElse
		completedUndoableAction({
         undoableType: PASTE_CLIPBOARD,
         message: createPasteClipboardMessage(cell),
         timestamp: Date.now(),
      });
		updatedPastingCellRange(false); // TODO move this to before completedUndoableAction
	}

	const handlePasteClipboardAsText = () => {
		updatedShowPasteOptionsModal(false);
		startedUndoableAction({ undoableType: PASTE_CLIPBOARD, timestamp: Date.now() });
		pasteText({ text: systemClipboard, cell, cellInPlaceEditorRef });
		completedUndoableAction({
         undoableType: PASTE_CLIPBOARD,
         message: createPasteClipboardMessage(cell),
         timestamp: Date.now(),
      });
		updatedPastingCellRange(false); // TODO move this to before completedUndoableAction
	}

	const handleCancelPaste = () => updatedShowPasteOptionsModal(false);

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

	return clipboardAsCells.length > 1 && isNothing(toCell)
		? (
			<div className="relative w-full z-50">
				<div className="absolute top-0 bg-white border border-grey-blue shadow-lg p-3" style={modalPositioning}>
					<div className="flex justify-center">
						<Button label="Paste As Range of Cells" classes="p-3" onClickFn={handlePasteClipboardAsRange}/>
						<Button label="Paste Clipboard" classes="p-3" onClickFn={handlePasteClipboardAsText}/>
						<Button label="Paste Neither" classes="p-3" onClickFn={handleCancelPaste}/>
					</div>
				</div>
			</div>
		)
		: (
			<div className="relative w-full z-50">
				<div className="absolute top-0 bg-white border border-grey-blue shadow-lg p-3" style={modalPositioning}>
					<div className="flex justify-center">
						<Button label="Paste Clipboard" classes="p-3" onClickFn={handlePasteClipboard}/>
						<Button label="Paste Range" classes="p-3" onClickFn={handlePasteRange}/>
						<Button label="Paste Neither" classes="p-3" onClickFn={handleCancelPaste}/>
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