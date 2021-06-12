import React from 'react';

// NOTE: both of the following, when rendered by the renderRegularCell function in Cell.js, 
// render only when the cell is updated (by editing)

// The following only prints the console log when it is actually rendering
const Blank = React.memo(({ row, column }) => {
   console.log('Blank.js returning empty <span>');
   return <span id={`blank_${row}_${column}`}></span>;
});


// The following will also only print the console log when actually rendering
/* const Blank = ({ row, column }) => {
   const blankSpan = React.useMemo(
      () => {
         console.log('Blank.js rendering a blank <span>');
         return <span id={`blank_${row}_${column}`}></span>
      },
      [row, column]
   )
   return blankSpan;
}; */

export default Blank;
