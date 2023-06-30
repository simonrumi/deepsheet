const R = require('ramda');
const {
   forLoopReduce,
   isNothing,
   isSomething,
   mapWithIndex,
   forLoopMap,
   arrayContainsSomething,
   getCellFromCells,
} = require('./index');
const { addSheetToUser } = require('./userHelpers');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // Per Stephen Grider: Mongoose's built in promise library is deprecated, replace it with ES2015 Promise
const { DEFAULT_ROWS, DEFAULT_COLUMNS, DEFAULT_TITLE, LOG } = require('../../constants');
const { log } = require('./logger');

const SheetModel = mongoose.model('sheet');
const HistoryModel = mongoose.model('history');

// This is a copy of a function on the client side
const getRandomKey = ({ remainingKeys = [], usedKeys = [] }) => {
	const MULTIPLIER = Math.pow(2, 24);
	if (remainingKeys.length > 0) {
		return {
			key: R.head(remainingKeys),
			remainingKeys: R.tail(remainingKeys), 
			usedKeys: R.pipe(R.head, R.append(R.__, usedKeys))(remainingKeys)
		}
	}
	// no remainingKeys to use, so we need to create a key, checking that it's not already in the usedKeys
	const generateKey = () => Math.floor(Math.random() * MULTIPLIER).toString(32);

	const key = R.until(
		key => R.not(R.find(R.equals(key), usedKeys)), // this is the predicate - a function that returns true if the generated key is not already being used
		generateKey, // this function is called until the predicate above returns true
		generateKey() // initial value for "key" to try in the predicate function
	)

	return {
		key,
		remainingKeys,
		usedKeys: R.append(key, usedKeys)
	};
}

// note that we are not trying to make sure that the keys are unique amongst all cells in the sheet
// only concerned that within a cell, each block has a unique key
// so since this is just creating a single cell with one block, we don't need to give
// the usedKeys in the call to getRandomKey
const createBlankCell = (row, column) => ({
   row,
   column,
   content: {
      subsheetId: null,
      formattedText: {
			blocks: [{
				inlineStyleRanges: [],
				text: '',
				key: R.pipe(getRandomKey, R.prop('key'))({}),
			}],
		},
   },
   visible: true,
});

const remapCellsInRow = ({ cellsInRow, rowRemapIndex }) =>{
   const remappedRow = mapWithIndex((cell, index) => {
      return ({ ...cell, row: rowRemapIndex, column: index });
   }, cellsInRow);
   return { remappedRow };
}

const getCellsInRow = ({ rowIndex, cells }) => {
   const { cellsInRow, remainingCells } = R.reduce(
      (accumulator, cell) => cell.row === rowIndex
         ? R.assoc('cellsInRow', R.append(cell, accumulator.cellsInRow), accumulator)
         : R.assoc('remainingCells', R.append(cell, accumulator.remainingCells), accumulator),
      { cellsInRow: [], remainingCells: [] }, //initial values
      cells
   );
   return { cellsInRow, remainingCells }; 
}

// note that this relies on getting the cellRange ordered by rows then columns. The client is doing this. 
// The alternative is to duplicate an orderCells() function on the server
// take the given array of cells and remap it so that it's top left corner is at cell A1 (i.e. index 0,0)
const remapRows = ({ cellRange, rowRemapIndex = 0, remappedCells = [] }) => {
   const rowIndex = cellRange[0].row;
   const  { cellsInRow, remainingCells } = getCellsInRow({ rowIndex, cells: cellRange });
   const { remappedRow } = remapCellsInRow({ cellsInRow, rowRemapIndex });
   const allRemappedCells = R.concat(remappedCells, remappedRow);
   return arrayContainsSomething(remainingCells)
      ? remapRows({ cellRange: remainingCells, rowRemapIndex: rowRemapIndex + 1, remappedCells: allRemappedCells })
      : allRemappedCells;
}

// note that here on the server, the cells are being moved from their original range positions to start at cell A1
// however the same transformation of the columnWidths and the rowHeights is done on the clien
// this is yeechy...it would probably be more in keeping with the thin-server approach to do it all on the client 
const createAllCells = ({ cellRange, totalColumns, totalRows }) => {
   const remappedCells = remapRows({ cellRange });
   return forLoopReduce(
      (accumulator, rowIndex) => {
         const rowOfCells = forLoopMap(
            columnIndex => {
               const cellFromRange = getCellFromCells({ row: rowIndex, column: columnIndex, cells: remappedCells });
               return isSomething(cellFromRange) ? cellFromRange : createBlankCell(rowIndex, columnIndex);
            },
            totalColumns
         );
         return R.concat(accumulator, rowOfCells);
      },
      [], // initial array
      totalRows
   );
}

const createBlankCells = ({ totalColumns, totalRows }) => forLoopReduce(
   (cellsAccumulator, rowIndex) => {
      const rowOfCells = forLoopReduce(
         (rowAccumulator, columnIndex) => R.pipe(
            createBlankCell, 
            R.append(R.__, rowAccumulator)
         )(rowIndex, columnIndex),
         [],
         totalColumns
      );
      return R.concat(cellsAccumulator, rowOfCells);
   },
   [],
   totalRows
);

const createNewSheet = ({
   rows = DEFAULT_ROWS,
   columns = DEFAULT_COLUMNS,
   title = DEFAULT_TITLE,
   parentSheetId = null,
   rowHeights = [],
   columnWidths = [],
   userId,
   cellRange,
}) => {
   if (isNothing(userId)) {
      throw new Error('must supply a userId when creating a sheet');
   }
   // need to make sure defaults are set here also, because the defaults above will only be set if the object keys are not present
   const totalRows = rows || DEFAULT_ROWS;
   const totalColumns = columns || DEFAULT_COLUMNS;
   title = title || DEFAULT_TITLE;
   rowHeights = rowHeights || [];
   columnWidths = columnWidths || [];
   const cells = isNothing(cellRange) ? createBlankCells({ totalRows, totalColumns }) : createAllCells({ cellRange, totalRows, totalColumns });
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
         rowHeights,
         columnWidths
      },
      cells,
      users: {
         owner: userId,
      },
   };
};

const saveSheetHistory = async ({ user, defaultSheetHistory, }) => {
	const newSheetHistory = await new HistoryModel(defaultSheetHistory).save();
	await addSheetToUser({ user, sheetId: newSheetHistory.present._id });
	return newSheetHistory;
}

const createNewSheetHistory = ({
   rows = DEFAULT_ROWS,
   columns = DEFAULT_COLUMNS,
   title = DEFAULT_TITLE,
   parentSheetId = null,
   rowHeights = [],
   columnWidths = [],
   userId,
   cellRange,
	existingSheet,
}) => {
	const newSheet = isSomething(existingSheet)
      ? existingSheet
      : createNewSheet({ rows, columns, title, parentSheetId, rowHeights, columnWidths, userId, cellRange });
	return {	past: [], present: newSheet, future: [], actionHistory: [] }
}

const getAllSheetsForUser = async userId => {
   try {
      const startTime = log({ level: LOG.VERBOSE, printTime: true }, 'sheetHelpers.getAllSheetsForUser starting find query for userId', userId);
      const allSheets = await SheetModel.find({ 'users.owner': userId });
      log({ level: LOG.VERBOSE, startTime }, 'sheetHelpers.getAllSheetsForUser finished find query.');

      return allSheets;
   } catch (err) {
      log({ level: LOG.ERROR }, 'sheetHelpers.getAllSheetsForUser', err.message);
      return err;
   }
};

const getLatestSheet = async sheetIds => {
   try {
      const startTime = log({ level: LOG.VERBOSE, printTime: true }, 'sheetHelpers--getLatestSheet starting find query for multiple sheetIds', sheetIds);
      const latestSheet = await SheetModel.find({ _id: { $in: sheetIds } })
         .sort({ 'metadata.lastAccessed': -1,  'metadata.lastUpdated': -1})
         .limit(1)
         .exec();
      log({ level: LOG.DEBUG, startTime }, 'sheetHelpers--getLatestSheet finished find query got latestSheet[0]', latestSheet[0]);
		return latestSheet[0];   

   } catch (err) {
      log({ level: LOG.ERROR }, 'sheetHelpers--getLatestSheet', err.message);
      return err;
   }
}

const getLatestSheetHistory = async sheetIds => {
	try {
		const startTime = log({ level: LOG.VERBOSE, printTime: true }, 'sheetHelpers--getLatestSheetHistory starting find query for multiple sheetIds', sheetIds);
		const latestSheetHistory = await HistoryModel.find({ present: { _id: { $in: sheetIds } } })
			.sort({ 'present.metadata.lastAccessed': -1,  'present.metadata.lastUpdated': -1})
			.limit(1)
			.exec();
		log({ level: LOG.DEBUG, startTime }, 'sheetHelpers--getLatestSheetHistory finished find query got latestSheetHistory[0]', latestSheetHistory[0]);
		return latestSheetHistory[0];  
	} catch(err) {
		log({ level: LOG.ERROR }, 'sheetHelpers--getLatestSheetHistory', err.message);
	}
}

module.exports = { createNewSheet, createNewSheetHistory, saveSheetHistory, getAllSheetsForUser, getLatestSheet, getLatestSheetHistory };
