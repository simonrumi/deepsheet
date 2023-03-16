import React, { useState, useEffect } from 'react';
import * as R from 'ramda';
import managedStore from '../../store';
import { createFloatingCellReducer } from '../../reducers/floatingCellReducers';
import { addedFloatingCellKeys, addedFloatingCell, updatedFloatingCellStartingPosition } from '../../actions/floatingCellActions';
import { focusedCell } from '../../actions/focusActions';
import { startedUndoableAction, completedUndoableAction } from '../../actions/undoActions';
import { isSomething } from '../../helpers';
import { stateFloatingCellStartingPosition } from '../../helpers/dataStructureHelpers';
import FloatingCellIcon from '../atoms/IconFloatingCell';
import { ADDED_FLOATING_CELL } from '../../actions/floatingCellTypes';
import { createNewFloatingCellMessage } from '../displayText';
import {
   FLOATING_CELL_TOP_OFFSET,
   FLOATING_CELL_LEFT_OFFSET,
   CELL_EDITOR_TOOLS_LEFT_OFFSET,
   ADD_FLOATING_CELL_BTN_WIDTH,
} from '../../constants';

const createDefaultStartingPosition = floatingCellContainerRef =>
   R.pipe(
      ref => ref.current.getBoundingClientRect(),
      R.pick(['top', 'left']),
      containerPosition => ({
         top: containerPosition.top + FLOATING_CELL_TOP_OFFSET,
         left: containerPosition.left + FLOATING_CELL_LEFT_OFFSET - CELL_EDITOR_TOOLS_LEFT_OFFSET + ADD_FLOATING_CELL_BTN_WIDTH,
      })
   )(floatingCellContainerRef);

const incrementStartingPosition = previousStartingPosition => ({
	top: previousStartingPosition.top + FLOATING_CELL_TOP_OFFSET,
	left: previousStartingPosition.left + FLOATING_CELL_LEFT_OFFSET,
});

const AddFloatingCellBtn = ({ sheetId, floatingCellContainerRef }) => {
	const [ newStartingPosition, setNewStartingPosition ]  = useState();

	const updateFloatingCellPositioning = () =>
      R.pipe(stateFloatingCellStartingPosition, previousStartingPosition =>
         isSomething(previousStartingPosition)
            ? incrementStartingPosition(previousStartingPosition)
            : createDefaultStartingPosition(floatingCellContainerRef)
      )(managedStore.state);

	const handleAddFloatingCell = sheetId => {
		startedUndoableAction({ undoableType: ADDED_FLOATING_CELL, timestamp: Date.now() });
		const updatedFloatingCellPositioning = updateFloatingCellPositioning();
		console.log('AddFloatingCellBtn--handleAddFloatingCell got updatedFloatingCellPositioning', updatedFloatingCellPositioning);
		setNewStartingPosition(updatedFloatingCellPositioning);
		const { floatingCellKey, floatingCell } = createFloatingCellReducer(sheetId, updatedFloatingCellPositioning);
		console.log('AddFloatingCellBtn--handleAddFloatingCell got floatingCellKey', floatingCellKey, 'floatingCell', floatingCell);
		addedFloatingCellKeys(floatingCellKey);
		addedFloatingCell(floatingCell);
		focusedCell(floatingCell);
		completedUndoableAction({
			undoableType: ADDED_FLOATING_CELL,
			message: createNewFloatingCellMessage(floatingCellKey),
			timestamp: Date.now(),
		});
	}

	useEffect(
		() => {
			if (isSomething(newStartingPosition)) {
				updatedFloatingCellStartingPosition(newStartingPosition);
			}
   	},
		[newStartingPosition]
	);

	return (
		<FloatingCellIcon
			classes={'flex-1 h-12 w-12'}
			onClickFn={() => handleAddFloatingCell(sheetId)}
      />
	);
}

export default AddFloatingCellBtn;