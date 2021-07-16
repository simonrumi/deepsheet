import React from 'react';
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
