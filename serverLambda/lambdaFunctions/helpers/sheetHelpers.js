const R = require('ramda');
const { forLoopReduce, isNothing } = require('./index');
const mongoose = require('mongoose');
const { DEFAULT_ROWS, DEFAULT_COLUMNS, DEFAULT_TITLE, DEFAULT_SUMMARY_CELL } = require('../../constants');

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

const createNewSheet = ({
   rows = DEFAULT_ROWS,
   columns = DEFAULT_COLUMNS,
   title = DEFAULT_TITLE,
   parentSheetId = null,
   summaryCell = DEFAULT_SUMMARY_CELL,
   summaryCellText = '',
   userId,
}) => {
   if (isNothing(userId)) {
      throw new Error('must supply a userId when creating a sheet');
   }
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
            columns
         );
         return R.concat(cellsAccumulator, rowOfCells);
      },
      [],
      rows
   );
   return {
      users: {
         owner: userId,
         collaborators: [],
      },
      title,
      metadata: {
         created: Date.now(),
         lastModified: Date.now(),
         totalRows: rows,
         totalColumns: columns,
         parentSheetId,
         summaryCell,
      },
      cells,
      users: {
         owner: userId,
      },
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
