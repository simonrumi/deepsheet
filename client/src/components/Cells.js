import React from 'react';
import { useSelector } from 'react-redux';
import * as R from 'ramda';
import { nothing, isSomething } from '../helpers';
import {
   stateTotalRows,
   stateTotalColumns,
   cellRow,
   cellColumn,
   stateRowVisibility,
   stateCellRange,
} from '../helpers/dataStructureHelpers';
import {
   shouldShowRow,
   isFirstColumn,
   isLastVisibleItemInAxis,
   isVisibilityCalcutated,
} from '../helpers/visibilityHelpers';
import { orderCells, getAllCells } from '../helpers/cellHelpers';
import { COLUMN_AXIS } from '../constants';
import ColumnHeaders from './organisms/ColumnHeaders';
import RowHeader from './organisms/RowHeader';
import LastRow from './organisms/LastRow';
import Cell from './molecules/Cell';
import managedStore from  '../store';

const Cells = () => {
   // const cellRange = useSelector(state => stateCellRange(state)); // TODO might need to reinstate use of cellRange, but it is causing unnecessary re-rendering of cells, so find a way to make it more targeted

   const renderEmptyEndCell = cell => (
      <Cell blankCell={true} row={cell.row} column={cell.column} classes={'border-r'} key={cellRow(cell) + '_endCell'}  /> // cellRange={cellRange}
   );

   const maybeEmptyEndCell = cell =>
   R.ifElse(
      isLastVisibleItemInAxis(
         COLUMN_AXIS, // we are rendering a row, so need to check if this is the last visible column in the row
         stateTotalColumns(managedStore.state),
         managedStore.state
      ),
      renderEmptyEndCell,
      nothing
   )(cell); 

   const renderRowHeader = cell => <RowHeader cell={cell} blankCell={false} key={'row_header_' + cellRow(cell)} />;

   const renderCell = cell => <Cell 
      row={cell.row}
      column={cell.column} 
      blankCell={false} 
      key={cellRow(cell) + '_' + cellColumn(cell)} 
   />;
   // cellRange={cellRange} 
   // TODO might need to reinstate use of cellRange, but it is causing unnecessary re-rendering of cells, so find a way to make it more targeted

   const maybeRowHeader = R.ifElse(isFirstColumn, renderRowHeader, nothing);

   const renderCellAndMaybeEdges = cell => {
      return [
         maybeRowHeader(cell), 
         renderCell(cell), 
         maybeEmptyEndCell(cell)
      ];
   };

   const maybeCell = (state, cell) => R.ifElse(
         shouldShowRow(stateRowVisibility(state)), 
         renderCellAndMaybeEdges, 
         nothing
      )(cell);

   const renderAllCells = cells => cells?.length > 0 &&
      isVisibilityCalcutated() &&
      isSomething(stateTotalRows(managedStore.state)) &&
      isSomething(stateTotalColumns(managedStore.state))
         ? R.pipe(
            orderCells(stateTotalRows(managedStore.state)),
            R.map(cell => maybeCell(managedStore.state, cell)),
            R.prepend(<ColumnHeaders key="columnHeaders" />),
            R.append(<LastRow key="lastRow" />),
         )(cells)
      : null;

   return R.pipe(
      getAllCells,
      renderAllCells,
   )(managedStore.state)
}
export default Cells;