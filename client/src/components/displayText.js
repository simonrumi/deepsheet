import React from 'react';

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


