const R = require('ramda');
const { forLoopReduce } = require('./index');

const createBlankCell = (row, column) => {
   return {
      row,
      column,
      content: {
         subsheetId: null,
         text: '',
      },
      visible: true,
   };
};

const createNewSheet = ({ totalRows, totalColumns, title, parentSheetId, summaryCell, summaryCellText }) => {
   const cells = forLoopReduce(
      (cellsAccumulator, rowIndex) => {
         const rowOfCells = forLoopReduce(
            (rowAccumulator, columnIndex) => {
               const cell = createBlankCell(rowIndex, columnIndex);
               if (summaryCell && summaryCell.row === rowIndex && summaryCell.column === columnIndex) {
                  cell.content.text = summaryCellText || '';
               }
               return R.append(cell, rowAccumulator);
            },
            [],
            totalColumns
         );
         return R.concat(cellsAccumulator, rowOfCells);
      },
      [],
      totalRows
   );
   return {
      title,
      metadata: {
         totalRows,
         totalColumns,
         parentSheetId,
         summaryCell,
      },
      cells,
   };
};

module.exports = { createNewSheet };
