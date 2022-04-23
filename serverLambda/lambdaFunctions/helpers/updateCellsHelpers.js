const R = require('ramda');
const { isSomething, isNothing } = require('./index');

const findCellByRowAndColumn = R.curry((row, column, cellsArr) => {
   return R.find(cell => R.propEq('row', row, cell) && R.propEq('column', column, cell))(cellsArr);
});

const updateAndAddCells = (sheetDoc, updatedCells) => {
	const originalCells = R.pipe(
		R.prop,
		R.map(cell => {
			const updatedCell = findCellByRowAndColumn(cell.row, cell.column, updatedCells);
			return isSomething(updatedCell) ? updatedCell : cell; 
		})
	)('cells', sheetDoc);

   const newCells = R.filter(
		cell => R.pipe(
			findCellByRowAndColumn, 
			isNothing
		)(cell.row, cell.column, originalCells)
	)(updatedCells);

   return isSomething(originalCells)
      ? isSomething(newCells)
         ? R.concat(originalCells, newCells)
         : originalCells
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

const updateParentWithSubsheetTitle = (parentSheet, subsheet) => R.map(
   parentCell => JSON.stringify(parentCell.content.subsheetId) === JSON.stringify(subsheet._id)
      ? { ...parentCell, content: { ...parentCell.content, text: subsheet.title } }
      : parentCell,
   parentSheet.cells
);

module.exports = {
   findCellByRowAndColumn,
   updateAndAddCells,
   deleteSubsheetId,
   updateParentWithSubsheetTitle,
};
