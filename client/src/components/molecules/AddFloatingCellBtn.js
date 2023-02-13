import React from 'react';
import { createFloatingCellReducer } from '../../reducers/floatingCellReducers';
import { addedFloatingCellKeys, updatedFloatingCell } from '../../actions/floatingCellActions';
import { focusedCell } from '../../actions/focusActions';
import AddIcon from '../atoms/IconAdd';

const handleAddFloatingCell = sheetId => {
	const { floatingCellKey, floatingCell } = createFloatingCellReducer(sheetId);
	console.log('AddFloatingCellBtn--handleAddFloatingCell got floatingCellKey', floatingCellKey, 'floatingCell', floatingCell);
	addedFloatingCellKeys(floatingCellKey);
	updatedFloatingCell(floatingCell);
	focusedCell(floatingCell);
}

const AddFloatingCellBtn = ({ sheetId }) => {
	return (
		<AddIcon
			classes={'flex-1 h-3 w-3'}
			onClickFn={() => handleAddFloatingCell(sheetId)}
      />
	);
}

export default AddFloatingCellBtn;