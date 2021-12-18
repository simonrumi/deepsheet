import React from 'react';
import { cellRow, cellColumn } from '../helpers/dataStructureHelpers';
import { createCellId } from '../helpers/cellHelpers';
import { indexToColumnLetter, indexToRowNumber, isSomething } from '../helpers';
import { ROW_AXIS, SORT_TYPE_TEXT, SORT_TYPE_NUMBERS, SORT_INCREASING } from '../constants';

export const DEFAULT_TITLE_FOR_SUBSHEET_FROM_CELL_RANGE = 'Sub-sheet created from a cell range';
export const SYSTEM_CLIPBOARD_UNAVAILABLE_MSG = 'This browser does not support reading from the system clipbaord, so copy-pasting will be limited';

export const menuSaveText = () => (
   <span>
      <span className="underline">Save</span> my Sheet!
   </span>
);

export const menuNewSheetText = () => (
   <span>
      Make me a <span className="underline">New Sheet</span>
   </span>
);

export const menuSheetsText = () => {
   const allClasses = 'p-2 text-subdued-blue font-semibold';
   return (
      <span className={allClasses} >
         I've got my sheets together:
      </span>
   );
};

export const menuDeleteSheetError = () => 'Aw sheet, couldn\'t delete it - try again later';

export const loginModalText = () => 'Log me in so I can save my sheet:'

export const networkErrorText = () => '(Your session probably timed out)';

export const cellRangePasteError = () => 'You can\'t paste over cells that link to other sheets';

export const pasteInfoModalText = ({ fromCellName, toCellName }) => 
   <div>
      <p>{`The cell range from ${fromCellName} to ${toCellName} has been copied to the clipboard.`}</p>
      <p>To paste it, click on the top-left cell, where you want the range to start, then either click the cell's paste icon or type Ctrl-V</p>
   </div>;

export const createPasteRangeUndoMessage = ({ fromCell, toCell, cell }) => {
	const fromCellId = createCellId(cellRow(fromCell), cellColumn(fromCell));
	const toCellId = createCellId(cellRow(toCell), cellColumn(toCell));
	const pasteCellId = createCellId(cellRow(cell), cellColumn(cell));
	return `Pasted cell-range ${fromCellId} - ${toCellId} to cell ${pasteCellId}`;
}

export const createPasteClipboardMessage = cell => `Pasted contents of clipboard to cell ${createCellId(cellRow(cell), cellColumn(cell))}`;

export const createInsertNewColumnsMessage = columnCount => `Added ${columnCount} column${columnCount > 1 ? 's': ''}`;

export const createInsertNewRowsMessage = rowCount => `Added ${rowCount} row${rowCount > 1 ? 's': ''}`;

export const createdEditedCellMessage = cell => `Edited cell ${createCellId(cellRow(cell), cellColumn(cell))}`;

export const createColumnDropMessage = ({ columnMovingIndex, toIndex }) => `Moved column ${indexToColumnLetter(columnMovingIndex)} to ${indexToColumnLetter(toIndex)}`;

export const createRowDropMessage = ({ rowMovingIndex, toIndex }) => `Moved row ${indexToRowNumber(rowMovingIndex)} to ${indexToRowNumber(toIndex)}`;

export const createToggleFreezeColumnMessage = ({ columnIndex }) => `Toggled freeze for column  ${indexToColumnLetter(columnIndex)}`;

export const createToggleFreezeRowMessage = ({ rowIndex }) => `Toggled freeze for row ${indexToRowNumber(rowIndex)}`;

export const createPasteRangeMessage = ({ cell }) => `Pasting a range to cell ${createCellId(cellRow(cell), cellColumn(cell))}`;

export const createSortAxisMessage = ({ axisName, rowIndex, columnIndex, sortType, sortDirection }) => {
   const sortTypeAsWord = sortType === SORT_TYPE_TEXT 
		? 'text' 
		: sortType === SORT_TYPE_NUMBERS 
			? 'numbers' 
			: 'dates';
	const sortDirectionAsWords = sortDirection === SORT_INCREASING ? 'low to high' : 'high to low';
   return axisName === ROW_AXIS
      ? `Sorted row ${indexToRowNumber(rowIndex)} as ${sortTypeAsWord} from ${sortDirectionAsWords}`
      : `Sorted column ${indexToColumnLetter(columnIndex)} as ${sortTypeAsWord} from ${sortDirectionAsWords}`;
};

export const createUpdateRowHeightMessage = ({ rowIndex }) => `Resized row ${indexToRowNumber(rowIndex)}`;

export const createUpdateColumnWidthMessage = ({ columnIndex }) => `Resized column ${indexToColumnLetter(columnIndex)}`;

export const updatedRowOrderMessage = () => 'Row order changed';

export const updatedColumnOrderMessage = () => 'Column order changed';

export const createFilterSheetMessage = ({ columnIndex, rowIndex }) => isSomething(columnIndex) 
	? `Filtered column ${indexToColumnLetter(columnIndex)}` 
	: isSomething(rowIndex)
		? `Filtered row ${indexToRowNumber(rowIndex)}`
		: 'Cleared all filters';

export const startMessage = () => 'Start';

export const editedTitleMessage = () => 'Edited sheet title';