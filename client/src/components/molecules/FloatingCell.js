import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import * as R from 'ramda';
import managedStore from '../../store';
import { MOVED_FLOATING_CELL } from '../../actions/floatingCellTypes';
import { hidePopups } from '../../actions';
import { updatedFloatingCell } from '../../actions/floatingCellActions';
import { focusedCell, clearedFocus, updatedFocusRef } from '../../actions/focusActions';
import { startedUndoableAction, completedUndoableAction } from '../../actions/undoActions';
import { runIfSomething } from '../../helpers';
import { convertBlocksToJsx, getFormattedText, decodeFormattedText } from  '../../helpers/richTextHelpers';
import {
   stateFloatingCell,
   floatingCellPosition,
   floatingCellPositionSetter,
   stateFocus,
   stateFocusCell,
   stateFocusAbortControl,
} from '../../helpers/dataStructureHelpers';
import DraggableElement from '../atoms/DraggableElement';
import CellInPlaceEditor from '../molecules/CellInPlaceEditor';
import MoveIcon from '../atoms/IconMove';
import { createMovedFloatingCellMessage } from '../displayText';
import { log } from '../../clientLogger';
import { LOG, FLOATING_CELL } from '../../constants';

const isFloatingCellFocused = ({ floatingCell, state }) => {
	const currentlyFocused = stateFocus(state);
	return R.hasPath(['cell'], currentlyFocused) && currentlyFocused.cell.number === floatingCell.number;
}

const createClassNames = ({ cellHasFocus }) => {
	const outline = cellHasFocus ? 'border border-burnt-orange ' : 'border border-grey-blue ';
	const dimensions = 'h-full w-full ';
	const cellBaseClasses = 'z-10 bg-white shadow-lg text-dark-dark-blue text-dark-dark-blue overflow-hidden p-1 ';
	return cellBaseClasses + dimensions + outline;
}

const getJsx = floatingCell => R.pipe(
		getFormattedText,
		decodeFormattedText,
		R.prop('blocks'), 
		convertBlocksToJsx
	)(floatingCell);

const FloatingCell = ({ floatingCellKey }) => {
	const floatingCell = useSelector(state => stateFloatingCell(state, floatingCellKey)); // stateFloatingCell(managedStore.state, floatingCellKey); // TIDY comment 
	const cellHasFocus = useSelector(state => isFloatingCellFocused({ floatingCell, state })); 
	log({ level: LOG.DEBUG }, '\n***FloatingCell started for floatingCellKey', floatingCellKey, 'floatingCell', floatingCell, 'cellHasFocus',cellHasFocus);

	const cellRef = useRef();

	// TODO NEXT BUG - history has the move event, and floatingCellPositioning is getting updated to the correct value
	// but the floating cell isn't being redrawn
	// put logging into DraggableElement to see whether it is getting the updated positioning

	const floatingCellPositioning = floatingCellPosition(floatingCell);
	console.log('FloatingCell got floatingCellPositioning', floatingCellPositioning);

	
	const handleDragStart = event => {
		startedUndoableAction({ undoableType: MOVED_FLOATING_CELL, timestamp: Date.now() });
	}

	const handleDragEnd = event => { 
		R.pipe(
			R.assoc('left', event.clientX),
			R.assoc('top', event.clientY,),
			floatingCellPositionSetter(R.__, floatingCell),
			updatedFloatingCell
		)(floatingCellPositioning);

		console.log('FloatingCell--handleDragEnd updatedFloatingCell with event.clientX', event.clientX, 'event.clientY', event.clientY);

		if (cellHasFocus) {
			const focusedCellPositioning = R.pipe(stateFocusCell, R.prop('positioning'))(managedStore.state);
			console.log('FloatingCell--handleDragEnd got focusedCellPositioning', focusedCellPositioning, 'vs the original floatingCellPositioning', floatingCellPositioning);

			if (!R.equals(floatingCellPositioning, focusedCellPositioning)) {
				focusedCell(floatingCell);
			}
		}
		
		completedUndoableAction({
			undoableType: MOVED_FLOATING_CELL,
			message: createMovedFloatingCellMessage(floatingCell),
			timestamp: Date.now(),
		});
	}

	const handleFloatingCellClick = event => {
		event.preventDefault();
		// make sure any old focus info is cleared first
		R.pipe(
			stateFocusAbortControl,
			abortControl => runIfSomething(abortCtrl => abortCtrl.abort(), abortControl)
		)(managedStore.state);
		updatedFocusRef(null); // clear the existing focusRef
		clearedFocus(); 
		// end of clearing old focus
		R.pipe(stateFloatingCell, focusedCell)(managedStore.state, floatingCellKey); //make sure we have the latest version of the floatingCell, otherwise we might be using something with an old position
		hidePopups();
	}

	const maybeRenderEditor = () => {
		if (cellHasFocus) {
			return (
            <CellInPlaceEditor
               cellToEdit={floatingCell}
               cellPositioning={floatingCellPositioning}
               cellHasFocus={cellHasFocus}
               key={floatingCellKey + '_inPlaceEditor'}
            />
         );
		}
		return null;
	}

	const renderFloatingCell = () => {
		const jsxText = getJsx(floatingCell);
	
		// MoveIcon can have these: onMouseDownFn={clickedEditorHeader} onMouseUpFn={releasedEditorHeader}
		return (
			<div className="flex">
				<MoveIcon classes="bg-white mr-1 w-6" />
				<div
					ref={cellRef}
					className={createClassNames({ cellHasFocus })}
					onClick={handleFloatingCellClick}>
					{jsxText}
				</div>
			</div>
		);
	}

	const renderDraggableFloatingCell = floatingCellPositioning => {
		return <DraggableElement
			classes="absolute"
			positioning={floatingCellPositioning}
			showBorder={false}
			onDragStartFn={handleDragStart}
			onDragEndFn={handleDragEnd}
			elementType={FLOATING_CELL}
			id={floatingCellKey}>
			{renderFloatingCell()}
		</DraggableElement>
	}

   return (<>
		{renderDraggableFloatingCell(floatingCellPositioning)}
		{maybeRenderEditor()}
	</>);
}

export default FloatingCell;