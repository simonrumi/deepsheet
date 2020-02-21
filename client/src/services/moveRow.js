import * as R from 'ramda';

const createArrayOfNums = length => {
   const arr = new Array(length);
   for (let i = 0; i < length; i++) {
      arr[i] = i;
   }
   return arr;
};

const mapOldIndicesToNewIndicies = (
   rowIndexToMove,
   insertAfterIndex,
   totalRows
) => {
   const initialArray = createArrayOfNums(totalRows);
   if (rowIndexToMove < insertAfterIndex) {
      const newFirstPart = R.slice(0, rowIndexToMove, initialArray); // less than rowIndexToMove is untouched
      const newSecondPart = R.slice(
         rowIndexToMove + 1,
         insertAfterIndex + 1,
         initialArray
      ); // from rowIndexToMove to insertIndex will be moved 1 closer to start
      // rowIndexToMove goes here
      const newEndPart = R.slice(insertAfterIndex + 1, totalRows, initialArray); // greater than insertIndex is untouched
      return R.pipe(
         R.concat,
         R.concat(R.__, [rowIndexToMove]),
         R.concat(R.__, newEndPart)
      )(newFirstPart, newSecondPart);
   }

   if (rowIndexToMove > insertAfterIndex) {
      const newFirstPart = R.slice(0, insertAfterIndex + 1, initialArray); // up to insertAfterIndex is untouched
      // rowIndexToMove goes here
      const newThirdPart = R.slice(
         insertAfterIndex + 1,
         rowIndexToMove,
         initialArray
      ); // from insertAfterIndex + 1 to rowIndexToMove - 1 will be moved 1 closer to end
      const newEndPart = R.slice(rowIndexToMove + 1, totalRows, initialArray); // greater than rowIndexToMove is untouched
      return R.pipe(
         R.concat,
         R.concat(R.__, newThirdPart),
         R.concat(R.__, newEndPart)
      )(newFirstPart, [rowIndexToMove]);
   }
};

const moveRowContent = (rowIndexToMove, insertBelowIndex, totalRows) => {
   const rowUpdateArr = mapOldIndicesToNewIndicies(
      rowIndexToMove,
      insertBelowIndex,
      totalRows
   );
   return rowUpdateArr; /// for a first test just console log out the array of new indices
};

export default (rowIndexToMove, insertBelowIndex, sheet) => {
   if (rowIndexToMove === insertBelowIndex) {
      return null;
   }
   console.log(
      'moveRowContent returned',
      moveRowContent(rowIndexToMove, insertBelowIndex, sheet.totalRows)
   ); /// for a first test just console log out the array of new indices
   // TODO updateVisibility(sheet); // probably need to recalculate whole sheet visibility
};
