import React from 'react';
import { useSelector } from 'react-redux';
import { isSomething, ifThenElse } from '../../helpers';
import { createCellId } from '../../helpers/cellHelpers';
import { pasteCellRangeToTarget, convertTextToCellRange, pasteText } from '../../helpers/clipboardHelpers';
import {
   stateCellRangeFrom,
   stateCellRangeTo,
   cellRow,
   cellColumn,
	stateFocusCell,
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
import { PASTE_OPTIONS_MODAL_WIDTH, MIN_ROW_HEIGHT } from '../../constants';
import { createPasteRangeMessage, createPasteClipboardMessage } from '../displayText';
import Button from '../atoms/Button';

const PasteOptionsModal = () => {
	const showModal = useSelector(state => stateShowPasteOptionsModal(state));
	const systemClipboard = useSelector(state => stateSystemClipboard(state));
	const fromCell = useSelector(state => stateCellRangeFrom(state));
	const toCell = useSelector(state => stateCellRangeTo(state));
	const positioning = useSelector(state => statePasteOptionsModalPositioning(state));
	const cell = useSelector(state => stateFocusCell(state));
	const blurCellInPlaceEditor = useSelector(state => stateBlurEditorFunction(state));

	if (!showModal) {
		return null;
	}

	const handlePasteClipboard = () => {
		const clipboardAsCells = convertTextToCellRange({ 
			text: systemClipboard,
			startingCellRowIndex: cellRow(cell), 
			startingCellColumnIndex: cellColumn(cell)
		});
		console.log('PasteOptionsModal--handlePasteClipboard got clipboardAsCells', clipboardAsCells);

		if (clipboardAsCells.length > 1) {
			startedUndoableAction({ undoableType: PASTE_CLIPBOARD, timestamp: Date.now() });
			updatedPastingCellRange(true);
			clearedCellRange(); // clears from, to, and cells
			replacedCellsInRange(clipboardAsCells);
			console.log('PasteOptionsModal--handlePasteClipboard about to call pasteCellRangeToTarget which should then call blurCellInPlaceEditor');
			ifThenElse({
				ifCond: pasteCellRangeToTarget, // if true, a correctly formed range was pasted
				thenDo: [ updatedShowPasteOptionsModal, blurCellInPlaceEditor ], // note: must happen in this order
				elseDo: pasteText, // just paste the raw clipboard text instead and don't blur
				params: { ifParams: cell, thenParams: false, elseParams: { text: systemClipboard, cell } }
			});
			const message = createPasteClipboardMessage(cell);
			completedUndoableAction({ undoableType: PASTE_CLIPBOARD, message, timestamp: Date.now() });
			updatedPastingCellRange(false);
			return;
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
		updatedPastingCellRange(false);
	}

	const handleCancelPaste = () => updatedShowPasteOptionsModal(false);

	const modalPositioning = {
		left: positioning.left + positioning.width,
		top: positioning.top - MIN_ROW_HEIGHT * 2, 
		width: PASTE_OPTIONS_MODAL_WIDTH,
	}
	// // we do have positioning.height, but CellInPlaceEditor seems to get rendered twice and the 2nd time the height value is reduce (to 5px in testing)
	// the bottom value is also changed, but no other values are changed
	// so the height is not reliable, so using MIN_ROW_HEIGHT * 2 instead, to find a reasonable place to put this modal dialog
	// TODO this could do with being more sophisticated, taking into account whether at the edge of the screen or not

	const fromCellId = isSomething(fromCell) ? createCellId(cellRow(fromCell), cellColumn(fromCell)) : null;
	const toCellId = isSomething(toCell) ? createCellId(cellRow(toCell), cellColumn(toCell)) : null;

	return (
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