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
   stateSheetCellsLoaded,
   statePresent
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

const renderEmptyEndCell = cell => (
   <Cell blankCell={true} cell={cell} classes={'border-r'} key={cellRow(cell) + '_endCell'} />
);

const maybeEmptyEndCell = cell =>
R.ifElse(
   isLastVisibleItemInAxis(
      COLUMN_AXIS, // we are rendering a row, so need to check if this is the last visible column in the row
      stateTotalColumns(managedStore.state),
      statePresent(managedStore.state)
   ),
   renderEmptyEndCell,
   nothing
)(cell); 

const renderRowHeader = cell => <RowHeader cell={cell} blankCell={false} key={'row_header_' + cellRow(cell)} />;

const renderCell = cell => <Cell cell={cell} blankCell={false} key={cellRow(cell) + '_' + cellColumn(cell)} />;

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

const renderCells = cells => {
   if (
      isVisibilityCalcutated() &&
      isSomething(stateTotalRows(managedStore.state)) &&
      cells?.length > 0
   ) {
      return R.pipe(
         orderCells,
         R.map(cell => maybeCell(managedStore.state, cell)),
         R.prepend(<ColumnHeaders key="columnHeaders" />),
         R.append(<LastRow key="lastRow" />)
      )(cells);
   }
   return null;
};

const Cells = () => {
   useSelector(state => stateSheetCellsLoaded(state));
   return R.pipe(
      getAllCells,
      renderCells,
   )(managedStore.state)
}
export default Cells;