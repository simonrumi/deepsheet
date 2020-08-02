import React from 'react';
export const menuSaveText = () => (
   <span>
      For godssakes <span className="underline">Save</span> my Sheet!
   </span>
);

export const menuNewSheetText = () => (
   <span>
      I can't take this Sheet any more, make me a <span className="underline">New Sheet</span>
   </span>
);

export const menuSheetsText = (classes, onClickFn) => {
   const allClasses = classes + ' underline';
   return (
      <span className={allClasses} onClick={onClickFn}>
         All the Deep Deep Sheets I'm in:
      </span>
   );
};
