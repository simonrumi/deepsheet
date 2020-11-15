const R = require('ramda');
const { isSomething, isNothing, arrayContainsSomething } = require('./index');

const findCellByRowAndColumn = R.curry((row, column, cellsArr) => {
   return R.find(cell => R.propEq('row', row, cell) && R.propEq('column', column, cell))(cellsArr);
});

const updateAndAddCells = (originalCells, updatedCells) => {
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

const maybeGetUpdatedSummaryCell = (sheet, updatedCells) => {
   const { row, column } = sheet.metadata.summaryCell;
   const updatedSummaryCell = R.filter(cell => cell.row === row && cell.column === column, updatedCells);
   return arrayContainsSomething(updatedSummaryCell) ? updatedSummaryCell[0] : null;
}

const updateSubsheetCellContent = (parentSheet, updatedSubsheetSummaryCell, sheetId) => R.map(
      parentCell => parentCell.content.subsheetId == sheetId
            ? { ...parentCell, content: { ...parentCell.content, text: updatedSubsheetSummaryCell?.content?.text } }
            : parentCell,
      parentSheet.cells
   );

module.exports = {
   findCellByRowAndColumn,
   updateAndAddCells,
   deleteSubsheetId,
   maybeGetUpdatedSummaryCell,
   updateSubsheetCellContent,
};
