/**
 * note that most functions here are very similar to functions in inserNewRow.js
 * common functions have been moved to insertNewAxis.js
 * but these remaining ones are different enough from their Row counterparts that it doesn't
 * seem worthwhile generalizing them further.
 **/
import * as R from 'ramda';
import managedStore from '../store';
import { addedCellKeys } from '../actions/cellActions';
import { startedUndoableAction, completedUndoableAction } from '../actions/undoActions';
import {
   updatedColumnVisibility,
   hasChangedMetadata,
   updatedColumnWidth,
   updatedTotalColumns,
} from '../actions/metadataActions';
import { UPDATED_TOTAL_COLUMNS } from '../actions/metadataTypes';
import { forLoopMap, forLoopReduce } from '../helpers';
import { shouldShowRow } from '../helpers/visibilityHelpers';
import {
   stateTotalColumns,
   stateTotalRows,
   stateColumnVisibility,
   stateRowVisibility,
} from '../helpers/dataStructureHelpers';
import {
   addNewCellsToStore,
   addNewCellsToCellDbUpdates,
   maybeAddAxisVisibilityEntry,
   createUpdatesForNewCellKeys,
} from './insertNewAxis';
import { addCellReducers } from '../reducers/cellReducers';
import { DEFAULT_COLUMN_WIDTH, } from '../constants';
import { createInsertNewColumnsMessage } from '../components/displayText';

const makeNewColumnCell = R.curry((rowIndex, columnIndex, rowVisibility) => {
   const partialCell = {
      row: rowIndex,
      column: columnIndex,
      content: { text: '', subsheetId: null },
      isStale: true,
   }
   return R.pipe(
      shouldShowRow(rowVisibility),
      R.assoc('visible', R.__, partialCell)
   )(partialCell);
});

const addOneCell = ({ columnIndex, rowIndex, cells }) => R.pipe(
      stateRowVisibility,
      makeNewColumnCell(rowIndex, columnIndex), // make the cell with the visibility set
      R.append(R.__, cells), // add the cell to the array of cells
   )(managedStore.state);

const createUpdatesForNewCells = ({
   cells,
   columnIndex,
   totalRows,
   rowIndex = 0,
}) => {
   if (totalRows === rowIndex) {
      return cells;
   }
   return createUpdatesForNewCells({
      cells: addOneCell({ columnIndex, rowIndex, cells }),
      columnIndex,
      totalRows,
      rowIndex: rowIndex + 1,
   });
};

const insertNewColumns = (additionalColumns = 1) => {
   startedUndoableAction({ undoableType: UPDATED_TOTAL_COLUMNS, timestamp: Date.now() });
   const totalColumns = stateTotalColumns(managedStore.state);

   const allUpdatedCells = forLoopReduce(
      (accumulator, columnCount) => R.pipe(
            createUpdatesForNewCells,
            R.concat(accumulator)
         )({
            cells: [], // initial value
            columnIndex: totalColumns + columnCount, // totalColumns, being the count of existing columns, gives us the index of the first additional column
            totalRows: stateTotalRows(managedStore.state)
         }),
      [], // initial value of allUpdatedCells
      additionalColumns // number of times through the loop
   );
   const updatedCellKeys = createUpdatesForNewCellKeys(allUpdatedCells);
   
   forLoopMap(
      columnCount => {
         maybeAddAxisVisibilityEntry(
            totalColumns + columnCount, // totalColumns, being the count of existing columns, gives us the index of the first additional column
            stateColumnVisibility(managedStore.state), 
            updatedColumnVisibility
         );
      },
      additionalColumns
   );
   
   addCellReducers(allUpdatedCells);
   addedCellKeys(updatedCellKeys);
   addNewCellsToStore(allUpdatedCells);
   addNewCellsToCellDbUpdates(allUpdatedCells);
   updatedTotalColumns(totalColumns, (totalColumns + additionalColumns));
   forLoopMap(
      columnCount => updatedColumnWidth((totalColumns + columnCount), DEFAULT_COLUMN_WIDTH),
      additionalColumns
   );
   hasChangedMetadata();
   completedUndoableAction({
      undoableType: UPDATED_TOTAL_COLUMNS,
      message: createInsertNewColumnsMessage(additionalColumns),
      timestamp: Date.now(),
   });
};

export default insertNewColumns;
