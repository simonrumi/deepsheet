import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import * as R from 'ramda';
import managedStore from '../../store';
import { hidePopups } from '../../actions';
import { updatedFloatingCell } from '../../actions/floatingCellActions';
import { focusedCell, clearedFocus, updatedFocusRef } from '../../actions/focusActions';
import { runIfSomething } from '../../helpers';
import { convertBlocksToJsx, getFormattedText, decodeFormattedText } from  '../../helpers/richTextHelpers';
import { stateFloatingCell, floatingCellPosition, floatingCellPositionSetter, stateFocus, stateFocusCell, stateFocusAbortControl } from '../../helpers/dataStructureHelpers';
import DraggableModal from '../atoms/DraggableModal';
import CellInPlaceEditor from '../molecules/CellInPlaceEditor';
import MoveIcon from '../atoms/IconMove';
import { log } from '../../clientLogger';
import { LOG } from '../../constants';

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
	log({ level: LOG.DEBUG }, '***FloatingCell started for floatingCellKey', floatingCellKey);
	const floatingCell = stateFloatingCell(managedStore.state, floatingCellKey);
	const cellHasFocus = useSelector(state => isFloatingCellFocused({ floatingCell, state })); 
	const cellRef = useRef();

	const handleDragEnd = event => { 
		R.pipe(
			R.assoc('left', event.clientX),
			R.assoc('top', event.clientY,),
			floatingCellPositionSetter(R.__, floatingCell),
			updatedFloatingCell
		)(floatingCellPositioning);

		if (cellHasFocus) {
			const focusedCellPositioning = R.pipe(stateFocusCell, R.prop('positioning'))(managedStore.state);
			if (!R.equals(floatingCellPositioning, focusedCellPositioning)) {
				focusedCell(floatingCell);
			}
		}
	}

	const handleFloatingCellClick = event => {
		console.log('--->FloatingCell--handleFloatingCellClick started for floatingCell', floatingCell);
		event.preventDefault();
		// make sure any old focus info is cleared first
		R.pipe(
			stateFocusAbortControl,
			abortControl => runIfSomething(abortCtrl => abortCtrl.abort(), abortControl)
		)(managedStore.state);
		// finalizeCellContent(cell); // TODO might need this in here but currently the functionality is in CellInPlaceEditor
		updatedFocusRef(null); // clear the existing focusRef
		clearedFocus(); 
		// end of clearing old focus
		R.pipe(stateFloatingCell, focusedCell)(managedStore.state, floatingCellKey); //make sure we have the latest version of the floatingCell, otherwise we might be using something with an old position
		hidePopups();
	}

	const floatingCellPositioning = floatingCellPosition(floatingCell);

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

   return (<>
		<DraggableModal
			classes="absolute"
			positioning={floatingCellPositioning}
			showBorder={false}
			onDragEndFn={handleDragEnd}
			id={floatingCellKey}>
			{renderFloatingCell()}
		</DraggableModal>
		{maybeRenderEditor()}
	</>);
}

export default FloatingCell;