const R = require('ramda');
const { isSomething } = require('./index');

const findCellByRowAndColumn = R.curry((row, column, cellsArr) => {
   return R.find(cell => R.propEq('row', row, cell) && R.propEq('column', column, cell))(cellsArr);
});

const updateCells = (originalCells, updatedCells) =>
   R.map(cell => {
      const updatedCell = findCellByRowAndColumn(cell.row, cell.column, updatedCells);
      return isSomething(updatedCell) ? updatedCell : cell;
   })(originalCells);

module.exports = { updateCells };
