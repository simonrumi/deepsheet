/**
 * note that most functions here are very similar to functions in insertNewColumns.js
 * common functions have been moved to insertNewAxis.js
 * but these remaining ones are different enough from their Column counterparts that it doesn't
 * seem worthwhile generalizing them further.
 **/
import * as R from 'ramda';
import managedStore from '../store';
import { addedCellKeys } from '../actions/cellActions';
import { updatedRowVisibility, hasChangedMetadata, updatedRowHeight, updatedTotalRows, } from '../actions/metadataActions';
import { startedUndoableAction, completedUndoableAction } from '../actions/undoActions';
import { shouldShowColumn } from '../helpers/visibilityHelpers';
import {
   addNewCellsToStore,
   addNewCellsToCellDbUpdates,
   maybeAddAxisVisibilityEntry,
   createUpdatesForNewCellKeys,
} from './insertNewAxis';
import { forLoopReduce, forLoopMap } from '../helpers';
import {
   stateTotalColumns,
   stateTotalRows,
   stateColumnVisibility,
   stateRowVisibility,
} from '../helpers/dataStructureHelpers';
import { addCellReducers } from '../reducers/cellReducers';
import { DEFAULT_ROW_HEIGHT } from '../constants';

const makeNewRowCell = R.curry((rowIndex, columnIndex, columnVisibility) => {
   const partialCell = {
      row: rowIndex,
      column: columnIndex,
      content: { text: '', subsheetId: null },
      isStale: true,
   }
   return R.pipe(
      shouldShowColumn,
      R.assoc('visible', R.__, partialCell)
   )(columnVisibility, columnIndex);

});

const addOneCell = ({ rowIndex, columnIndex, cells }) => R.pipe(
      stateColumnVisibility,
      makeNewRowCell(rowIndex, columnIndex), // make the cell with the visibility set
      R.append(R.__, cells), // add the cell to the array of cells
   )(managedStore.state);

const createUpdatesForNewCells = ({
   cells,
   rowIndex,
   totalColumns,
   columnIndex = 0
}) => {
   if (totalColumns === columnIndex) {
      return cells;
   }
   return createUpdatesForNewCells({
      cells: addOneCell({ rowIndex, columnIndex, cells }),
      rowIndex,
      totalColumns,
      columnIndex: columnIndex + 1
   });
};

const insertNewRows = (additionalRows = 1) => {
   startedUndoableAction();
   const totalRows = stateTotalRows(managedStore.state);

   const allUpdatedCells = forLoopReduce(
      (accumulator, rowCount) => R.pipe(
            createUpdatesForNewCells,
            R.concat(accumulator)
         )({
            cells: [], // initial value
            rowIndex: totalRows + rowCount, // totalRows, being the count of existing rows, gives us the index of the first additional row
            totalColumns: stateTotalColumns(managedStore.state)
         }),
      [], // initial value of allUpdatedCells
      additionalRows // number of times through the loop
   );
   const updatedCellKeys = createUpdatesForNewCellKeys(allUpdatedCells);

   forLoopMap(
      rowCount => {
         maybeAddAxisVisibilityEntry(
            totalRows + rowCount, // totalRows, being the count of existing rows, gives us the index of the first additional row
            stateRowVisibility(managedStore.state), 
            updatedRowVisibility
         );
      },
      additionalRows
   );

   addCellReducers(allUpdatedCells);
   addedCellKeys(updatedCellKeys);
   addNewCellsToStore(allUpdatedCells);
   addNewCellsToCellDbUpdates(allUpdatedCells);
   updatedTotalRows(totalRows, totalRows + additionalRows);
   forLoopMap(
      rowCount => updatedRowHeight((totalRows + rowCount), DEFAULT_ROW_HEIGHT),
      additionalRows
   );
   hasChangedMetadata();
   completedUndoableAction(`added ${additionalRows} row(s)`);
};

export default insertNewRows;
