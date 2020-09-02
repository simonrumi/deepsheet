const R = require('ramda');
const { isSomething, isNothing } = require('./index');

const findCellByRowAndColumn = R.curry((row, column, cellsArr) => {
   return R.find(cell => R.propEq('row', row, cell) && R.propEq('column', column, cell))(cellsArr);
});

const updateCells = (originalCells, updatedCells) => {
   const originalCellsUpdated = R.map(cell => {
      const updatedCell = findCellByRowAndColumn(cell.row, cell.column, updatedCells);
      return isSomething(updatedCell) ? updatedCell : cell;
   })(originalCells);

   const newCells = R.filter(cell => R.pipe(findCellByRowAndColumn, isNothing)(cell.row, cell.column, originalCells))(
      updatedCells
   );

   return isSomething(originalCellsUpdated)
      ? isSomething(newCells)
         ? R.concat(originalCellsUpdated, newCells)
         : originalCellsUpdated
      : isSomething(newCells)
      ? newCells
      : null;
};

const deleteSubsheetId = (originalCells, row, column, text = '') =>
   R.map(cell => {
      if (cell.row === row && cell.column === column) {
         const newContent = { ...cell.content, subsheetId: null, text };
         return { ...cell, content: newContent };
      }
      return cell;
   })(originalCells);

module.exports = { findCellByRowAndColumn, updateCells, deleteSubsheetId };
