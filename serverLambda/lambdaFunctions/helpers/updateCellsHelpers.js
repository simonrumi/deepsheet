const R = require('ramda');
const { isSomething, isNothing, arrayContainsSomething } = require('./index');

const findCellByRowAndColumn = R.curry((row, column, cellsArr) => {
   return R.find(cell => R.propEq('row', row, cell) && R.propEq('column', column, cell))(cellsArr);
});

const updateAndAddCells = R.curry((sheetDoc, updatedCells) => {
	const updatedExistingRegularCells = R.pipe(
		R.prop('cells'),
		R.map(cell => {
			const updatedCell = findCellByRowAndColumn(cell.row, cell.column, updatedCells);
			return isSomething(updatedCell) ? updatedCell : cell; 
		})
	)(sheetDoc);

   const addedRegularCells = R.filter(
		cell => R.pipe(
			findCellByRowAndColumn, 
			isNothing
		)(cell.row, cell.column, updatedExistingRegularCells)
	)(updatedCells);

   return isSomething(updatedExistingRegularCells)
      ? isSomething(addedRegularCells)
         ? R.concat(updatedExistingRegularCells, addedRegularCells)
         : updatedExistingRegularCells
      : isSomething(addedRegularCells)
         ? addedRegularCells
         : null;
});

const removeDeletedCells = (sheetDoc, deletedCells) => R.pipe(
	R.prop('cells'),
	R.filter(
		cell => R.pipe(
			findCellByRowAndColumn,
			isNothing
		)(cell.row, cell.column, deletedCells)
	)
)(sheetDoc);

const findFloatingCellByNumber = R.curry((number, cellsArr) => {
   return R.find(floatingCell => R.propEq('number', number, floatingCell))(cellsArr);
});

const updateAndAddFloatingCells  = R.curry((sheetDoc, updatedFloatingCells) => {
	const updatedExistingFloatingCells = R.pipe(
		R.prop,
		R.map(floatingCell => {
			const updatedFloatingCell = findFloatingCellByNumber(floatingCell.number, updatedFloatingCells);
			return isSomething(updatedFloatingCell) ? updatedFloatingCell : floatingCell; 
		})
	)('floatingCells', sheetDoc);

	const addedFloatingCells = R.filter(
		floatingCell => R.pipe(
			findFloatingCellByNumber, 
			isNothing
		)(floatingCell.number, updatedExistingFloatingCells)
	)(updatedFloatingCells);

	return arrayContainsSomething(updatedExistingFloatingCells)
      ? arrayContainsSomething(addedFloatingCells)
         ? R.concat(updatedExistingFloatingCells, addedFloatingCells)
         : updatedExistingFloatingCells
      : arrayContainsSomething(addedFloatingCells)
         ? addedFloatingCells
         : null;
});

const removeDeletedFloatingCells = (sheetDoc, deletedFloatingCells) => R.pipe(
	R.prop('floatingCells'),
	R.filter(
		floatingCell => R.pipe(
			findFloatingCellByNumber,
			isNothing
		)(floatingCell.number, deletedFloatingCells)
	)
)(sheetDoc);

const deleteSubsheetId = ({ originalCells, row, column, formattedText }) =>
   R.map(cell => {
      if (cell.row === row && cell.column === column) {
         const newContent = { ...cell.content, subsheetId: null, formattedText };
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
	updateAndAddFloatingCells,
	removeDeletedCells,
	removeDeletedFloatingCells,
   deleteSubsheetId,
   updateParentWithSubsheetTitle,
};
