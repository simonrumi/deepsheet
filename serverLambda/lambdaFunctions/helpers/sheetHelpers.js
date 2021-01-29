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
   rowHeights = [],
   columnWidths = [],
   userId,
}) => {
   if (isNothing(userId)) {
      throw new Error('must supply a userId when creating a sheet');
   }
   // need to make sure defaults are set here also, because the defaults above will only be set if the object keys are not present
   const totalRows = rows || DEFAULT_ROWS;
   const totalColumns = columns || DEFAULT_COLUMNS;
   summaryCell = summaryCell || DEFAULT_SUMMARY_CELL;
   title = title || DEFAULT_TITLE;
   rowHeights = rowHeights || [];
   columnWidths = columnWidths || [];
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
      users: {
         owner: userId,
         collaborators: [],
      },
      title,
      metadata: {
         created: Date.now(),
         lastUpdated: Date.now(),
         totalRows,
         totalColumns,
         parentSheetId,
         summaryCell,
         rowHeights,
         columnWidths
      },
      cells,
      users: {
         owner: userId,
      },
   };
};

const getAllSheetsForUser = async userId => {
   try {
      const allSheets = await SheetModel.find({ 'users.owner': userId });
      return allSheets;
   } catch (err) {
      console.log('Error returning all sheets', err);
      return err;
   }
};

const getLatestSheet = async sheetIds => {
   try {
      const latestSheet = await SheetModel.find({ _id: { $in: sheetIds } })
         .sort({ 'metadata.lastAccessed': -1,  'metadata.lastUpdated': -1})
         .limit(1)
         .exec();
      return latestSheet[0];   

   } catch (err) {
      console.log('Error getting latest sheet', err);
      return err;
   }
}

module.exports = { createNewSheet, getAllSheetsForUser, getLatestSheet };
