const R = require('ramda');
const { forLoopReduce, isNothing } = require('./index');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // Per Stephen Grider: Mongoose's built in promise library is deprecated, replace it with ES2015 Promise
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
      const startTime = new Date();
      console.log('sheetHelpers.getAllSheetsForUser starting find query for userId', userId, 'time', startTime);
      const allSheets = await SheetModel.find({ 'users.owner': userId });
      const queryLength = (new Date() - startTime) / 1000;
      console.log('sheetHelpers.getAllSheetsForUser finished find query. It took', queryLength);
      return allSheets;
   } catch (err) {
      console.log('Error returning all sheets', err);
      return err;
   }
};

const getLatestSheet = async sheetIds => {
   try {
      const startTime = new Date();
      console.log('sheetHelpers.getLatestSheet starting find query for multiple sheetIds, start time', startTime);
      const latestSheet = await SheetModel.find({ _id: { $in: sheetIds } })
         .sort({ 'metadata.lastAccessed': -1,  'metadata.lastUpdated': -1})
         .limit(1)
         .exec();
      const queryLength = (new Date() - startTime) / 1000;
      console.log('sheetHelpers.getLatestSheet finished find query. It took', queryLength);
      return latestSheet[0];   

   } catch (err) {
      console.log('Error getting latest sheet', err);
      return err;
   }
}

module.exports = { createNewSheet, getAllSheetsForUser, getLatestSheet };
