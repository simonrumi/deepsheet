const R = require('ramda');
const { isSomething, isNothing } = require('./index');

const findCellByRowAndColumn = R.curry((row, column, cellsArr) => {
   return R.find(cell => R.propEq('row', row, cell) && R.propEq('column', column, cell))(cellsArr);
});

const updateCells = (originalCells, updatedCells) => {
   console.log('updateCellsHelper.updateCells got originalCells', originalCells, 'updatedCells', updatedCells);
   const originalCellsUpdated = R.map(cell => {
      const updatedCell = findCellByRowAndColumn(cell.row, cell.column, updatedCells);
      return isSomething(updatedCell) ? updatedCell : cell;
   })(originalCells);
   console.log('updateCellsHelper.updateCells originalCellsUpdated', originalCellsUpdated);

   const newCells = R.filter(cell => R.pipe(findCellByRowAndColumn, isNothing)(cell.row, cell.column, originalCells))(
      updatedCells
   );
   console.log('updateCellsHelper.updateCells newCells', newCells);

   return isSomething(originalCellsUpdated)
      ? isSomething(newCells)
         ? R.concat(originalCellsUpdated, newCells)
         : originalCellsUpdated
      : isSomething(newCells)
      ? newCells
      : null;
};

module.exports = { updateCells };
