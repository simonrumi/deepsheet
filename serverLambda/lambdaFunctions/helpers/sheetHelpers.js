const R = require('ramda');
const { forLoopReduce } = require('./index');
const mongoose = require('mongoose');

const SheetModel = mongoose.model('sheet');

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

const getAllSheets = async () => {
   console.log('will need to updated sheetHelpers.getAllSheets to get sheets only for a user');
   try {
      return await SheetModel.find({});
   } catch (err) {
      console.log('Error returning all sheets', err);
      return err;
   }
};

module.exports = { createNewSheet, getAllSheets };
