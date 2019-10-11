import { map, reduce, concat } from 'ramda';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Header from './Header';
import Editor from './Editor';
import Row from './Row';
import { fetchSheet } from '../helpers';
import {
   fetchedSheet,
   populateCellsInStore,
   updatedCellKeys,
} from '../actions';
import { createCellReducers } from '../reducers/cellReducers';
import managedStore from '../store';

class App extends Component {
   constructor(props) {
      super(props);
      this._sheet = {};
   }
   async componentDidMount() {
      //populate the store with the sheet data
      this._sheet = await fetchSheet();
      this.props.fetchedSheet(this._sheet.metadata);
      this.initializeCells();
   }

   initializeCells() {
      if (this.props.managedStore.store && this._sheet.metadata) {
         const newCombinedReducer = createCellReducers(this._sheet.metadata);
         this.props.managedStore.store.replaceReducer(newCombinedReducer);
         populateCellsInStore(this._sheet);
         this.props.updatedCellKeys(this.createCellKeys());
         delete this._sheet; // after populating the data into the store, we don't need a duplicate copy of the data hanging around
      } else {
         console.log(
            'WARNING: App.render.initializeCells had no data to operate on'
         );
      }
   }

   // generates a flat array of all the key names to identify cells in the sheet
   createCellKeys() {
      return reduce(
         (accumulator, row) => {
            const rowOfCells = map(
               cell => 'cell_' + cell.metadata.row + '_' + cell.metadata.column,
               row.columns
            );
            return concat(accumulator, rowOfCells);
         },
         [], // starting value for accumulator
         this._sheet.rows
      );
   }

   render() {
      return (
         <div className="ui container">
            <Header />
            <div className="editor-container">
               <Editor />
            </div>
            <div className="grid-container" style={this.renderGridSizingSyle()}>
               {this.renderRows()}
            </div>
            <div className="clear" />
         </div>
      );
   }

   renderRows() {
      if (
         this.props.sheet &&
         this.props.sheet.metadata &&
         this.props.cellKeys &&
         this.props.cellKeys.length > 0
      ) {
         //QQQQ const generateCells = map(something in here using cellKeys and so on)

         const generateRows = map(row => (
            <Row cells={row.content} key={row.metadata.row} />
         ));
         return generateRows(this.props.sheet.content);
      }
      return <div>No row data yet</div>;
   }

   renderGridSizingSyle() {
      if (this.props.sheet.metadata) {
         const columnsStyle =
            'repeat(' +
            this.props.sheet.metadata.totalColumns +
            ', [col-start] 1fr)';
         const rowsStyle =
            'repeat(' +
            this.props.sheet.metadata.totalRows +
            ', [row-start] 1fr)';
         return {
            gridTemplateColumns: columnsStyle,
            gridTemplateRows: rowsStyle,
         };
      }
   }
}

function mapStateToProps(state) {
   return {
      //rows: state.rows,
      sheet: state.sheet,
      managedStore,
      cellKeys: state.cellKeys,
   };
}

export default connect(
   mapStateToProps,
   {
      fetchedSheet,
      populateCellsInStore,
      updatedCellKeys,
   }
)(App);
