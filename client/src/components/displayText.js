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

export const menuSheetsText = (classes, onClickFn) => {
   const allClasses = classes + ' underline';
   return (
      <span className={allClasses} onClick={onClickFn}>
         Show my Sheets:
      </span>
   );
};
