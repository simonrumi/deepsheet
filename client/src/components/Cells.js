import React from 'react';
import * as R from 'ramda';
import { nothing, isSomething, ifThenElse } from '../helpers';
import {
   stateTotalRows,
   stateTotalColumns,
   cellRow,
   cellColumn,
   stateRowVisibility,
   cellVisible,
} from '../helpers/dataStructureHelpers';
import {
   shouldShowRow,
   isFirstColumn,
   isLastVisibleItemInAxis,
   isVisibilityCalculated,
} from '../helpers/visibilityHelpers';
import { orderCells, getAllCells } from '../helpers/cellHelpers';
import { updatedEndOfRowCell } from '../actions/cellActions';
import { COLUMN_AXIS } from '../constants';
import ColumnHeaders from './organisms/ColumnHeaders';
import RowHeader from './organisms/RowHeader';
import LastRow from './organisms/LastRow';
import Cell from './molecules/Cell';
import managedStore from  '../store';

const Cells = () => {
   const renderEmptyEndCell = cell => {
		return (
      <Cell blankCell={true} endCell={true} row={cell.row} column={cell.column} classes={'border-r'} key={cellRow(cell) + '_endCell'}  />
   )}; // TIDY

   const maybeEmptyEndCell = cell => ifThenElse({ 
		ifCond: isLastVisibleItemInAxis,
		thenDo: [ 
			renderEmptyEndCell, 
			endCell => {
				setTimeout(() => updatedEndOfRowCell({ ...cell, isEndOfRow: true }), 0); // need this to avoid a console error. Can't easily put it in a useEffect, because we only know here whether or not to do this
				return endCell;
			} 
		],
		elseDo: nothing, // returns null, since undefined would create an error
		params: { 
			ifParams: [
				COLUMN_AXIS, // we are rendering a row, so need to check if this is the last visible column in the row
				stateTotalColumns(managedStore.state),
				managedStore.state,
				cell
			],
			thenParams: cell,
		}
	});

   const renderRowHeader = cell => <RowHeader cell={cell} blankCell={false} key={'row_header_' + cellRow(cell)} />;

   const renderCell = cell => <Cell 
      row={cellRow(cell)}
      column={cellColumn(cell)} 
      blankCell={false}
      isVisible={cellVisible(cell)}
      key={cellRow(cell) + '_' + cellColumn(cell)} 
   />; // note the key is needed by React, otherwise it complains

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
      isVisibilityCalculated(managedStore.state) &&
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