import React, { Component } from 'react';
import * as R from 'ramda';
import managedStore from '../../store';
import { connect } from 'react-redux';
import { updatedTotalRows, updatedCellKeys, updatedCell } from '../../actions';
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
   }

   getVisibilityForColumn = columnIndex => {
      console.log(
         'getVisibilityForColumn, columnIndex',
         columnIndex,
         'visibility obj',
         R.prop('columnVisibility', this.props.sheet)
      );
      const tempReturnObj = R.pipe(
         getAxisVisibilityName,
         R.prop(R.__, this.props.sheet), // gets the column visibility object
         shouldShowColumn(R.__, columnIndex) // TODO BUG HERE ...why does this return false when true? why do we get 5 columns instead of 4?
      )(COLUMN_AXIS);
      console.log('about to return', tempReturnObj);
      return tempReturnObj;
   };

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
      return R.ifElse(
         R.equals(this.props.totalColumns), // totalColumns gives us the number of new cells we need to create
         R.thunkify(R.identity)(updates), // return the new cellKeys and cellReducers
         R.thunkify(this.createUpdatesForNewCells)(
            this.addOneCell(rowIndex, columnIndex, updates),
            rowIndex,
            columnIndex + 1
         )
      )(columnIndex);
   };

   addRowOfBlankCells = () => {
      const updates = this.createUpdatesForNewCells(
         { cellKeys: this.props.cellKeys, cellReducers: {}, cells: [] },
         this.props.totalRows
      ); // totalRows, being the count of existing rows, will give us the index of the next row
      console.log('addRowOfBlankCells, got updates', updates);
      updatedCellKeys(updates.cellKeys);
      this.addManyCellReducersToStore(updates.cellReducers);
      this.addNewCellsToStore(updates.cells);
   };

   /* original versions
   createNewCellKeys = (
      newCellKeys,
      totalColumns,
      rowIndex,
      columnIndex = 0
   ) => {
      return R.ifElse(
         R.equals(totalColumns), // if the columnIndex === totalColumns
         R.thunkify(R.identity)(newCellKeys), // return the newCellKeys
         R.thunkify(this.createNewCellKeys)(
            this.appendOneCellKey(rowIndex, columnIndex, newCellKeys),
            totalColumns,
            rowIndex,
            columnIndex + 1
         )
      )(columnIndex);
   };

   addRowOfBlankCells = () => {
      // totalRows, being the count of existing rows, will give us the index of the next row
      // totalColumns gives us the number of new cells we need to create
      R.pipe(
         this.createNewCellKeys, // TODO need to call createUpdatesForNewCells instead
         updatedCellKeys // TODO change to somthing like updatedCellKeys(updates.cellKeys)
         // BUT also need to do this
         // addManyCellReducersToStore(updates.cellReducers)
      )(this.props.cellKeys, this.props.totalColumns, this.props.totalRows);
   }; */

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
