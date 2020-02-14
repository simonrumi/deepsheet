import React, { Component } from 'react';
import * as R from 'ramda';
import managedStore from '../../store';
import { connect } from 'react-redux';
import {
   updatedTotalRows,
   updatedCellKeys,
   updatedCell,
   updatedRowVisibility,
} from '../../actions';
import { createCellKey } from '../../helpers/cellHelpers';
import { cellReducerFactory } from '../../reducers/cellReducers';
import { COLUMN_AXIS } from '../../helpers';
import {
   shouldShowColumn,
   getAxisVisibilityName,
} from '../../helpers/visibilityHelpers';
import IconAdd from '../atoms/IconAdd';

class RowAdder extends Component {
   constructor(props) {
      super(props);
      this.addRowOfBlankCells = this.addRowOfBlankCells.bind(this);
      this.insertNewRow = this.insertNewRow.bind(this);
      this.createUpdatesForNewCells = this.createUpdatesForNewCells.bind(this);
      this.addNewCellsToStore = this.addNewCellsToStore.bind(this);
      this.addOneCell = this.addOneCell.bind(this);
      this.addOneCellReducer = this.addOneCellReducer.bind(this);
      this.addManyCellReducersToStore = this.addManyCellReducersToStore.bind(
         this
      );
      this.makeNewCell = this.makeNewCell.bind(this);
      this.getVisibilityForColumn = this.getVisibilityForColumn.bind(this);
   }

   getVisibilityForColumn = columnIndex =>
      R.pipe(
         getAxisVisibilityName,
         R.prop(R.__, this.props.sheet), // gets the column visibility object
         shouldShowColumn(R.__, columnIndex)
      )(COLUMN_AXIS);

   makeNewCell = (rowIndex, columnIndex) => {
      return {
         row: rowIndex,
         column: columnIndex,
         content: '',
         visible: this.getVisibilityForColumn(columnIndex),
      };
   };

   addManyCellReducersToStore = cellReducers => {
      const combineNewReducers = managedStore.store.reducerManager.addMany(
         cellReducers
      );
      managedStore.store.replaceReducer(combineNewReducers);
   };

   // returns copy of cellReducers with and added cellReducer
   addOneCellReducer = (cellKey, row, column, cellReducers = {}) =>
      R.pipe(
         cellReducerFactory,
         R.assoc(cellKey, R.__, cellReducers)
      )(row, column);

   addOneCell = (rowIndex, columnIndex, updates) => {
      const cellKey = createCellKey(rowIndex, columnIndex);
      const cellKeys = R.append(cellKey, updates.cellKeys);
      const cellReducers = this.addOneCellReducer(
         cellKey,
         rowIndex,
         columnIndex,
         updates.cellReducers
      );
      const cell = this.makeNewCell(rowIndex, columnIndex);
      const cells = R.append(cell, updates.cells);
      return { cellReducers, cellKeys, cells };
   };

   addNewCellsToStore = cells => {
      console.log('addNewCellsToStore, got cells', cells);
      R.map(cell => updatedCell(cell), cells);
   };

   createUpdatesForNewCells = (
      updates, //contains { cellReducers, cellKeys, cells }
      rowIndex,
      columnIndex = 0
   ) => {
      if (this.props.totalColumns === columnIndex) {
         return updates;
      }
      return this.createUpdatesForNewCells(
         this.addOneCell(rowIndex, columnIndex, updates),
         rowIndex,
         columnIndex + 1
      );
   };

   addRowOfBlankCells = () => {
      const updates = this.createUpdatesForNewCells(
         { cellKeys: this.props.cellKeys, cellReducers: {}, cells: [] },
         this.props.totalRows
      ); // totalRows, being the count of existing rows, will give us the index of the next row
      console.log('addRowOfBlankCells, got updates', updates);
      updatedCellKeys(updates.cellKeys);
      this.addManyCellReducersToStore(updates.cellReducers);

      // TODO tidy up this if statement
      if (
         this.props.sheet.rowVisibility &&
         !R.has(this.props.totalRows, this.props.sheet.rowVisibility)
      ) {
         updatedRowVisibility(R.assoc(this.props.totalRows, true, {}));
      }

      this.addNewCellsToStore(updates.cells);
   };

   insertNewRow = () => {
      this.addRowOfBlankCells();
      updatedTotalRows(this.props.totalRows + 1);
   };

   render() {
      return (
         <div className={this.props.classes} data-testid="rowAdder">
            <div className="flex items-center px-2 py-2">
               <IconAdd
                  classes={'flex-1 h-3 w-3'}
                  onClickFn={this.insertNewRow}
               />
            </div>
         </div>
      );
   }
}

function mapStateToProps(state, ownProps) {
   return {
      sheet: state.sheet,
      totalRows: state.sheet.totalRows,
      totalColumns: state.sheet.totalColumns,
      cellKeys: state.cellKeys,
      classes: ownProps.classes,
   };
}

export default connect(mapStateToProps)(RowAdder);
