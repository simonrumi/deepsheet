import { map } from 'ramda';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Header from './Header';
import Editor from './Editor';
import Cell from './Cell';
import { fetchedSheet, updatedSheetId, updatedCellKeys } from '../actions';
import managedStore from '../store';

class Sheet extends Component {
   async componentDidMount() {
      this.props.updatedSheetId(this.props.sheetId);
   }

   render() {
      return (
         <div className="ui container">
            <Header />
            <div className="editor-container">
               <Editor />
            </div>
            <div className="grid-container" style={this.renderGridSizingSyle()}>
               {this.renderCells()}
            </div>
            <div className="clear" />
         </div>
      );
   }

   renderCells() {
      if (
         this.props.sheet &&
         this.props.sheet.totalRows &&
         this.props.cellKeys &&
         this.props.cellKeys.length > 0 &&
         this.props.sheetId === this.props.sheet._id
      ) {
         return map(
            cellKey => <Cell cellKey={cellKey} key={cellKey} />,
            this.props.cellKeys
         );
      }
      return <div>No row data yet</div>;
   }

   renderGridSizingSyle() {
      if (this.props.sheet) {
         // note we're creating eg "repeat(4, [col-start] 1fr)"  to repeat 4 times, columns that take up 1fr
         // (1 out of the free space) which makes them equal size; and where 'col-start' is just a name.
         const columnsStyle =
            'repeat(' + this.props.sheet.totalColumns + ', [col-start] 1fr)';
         const rowsStyle =
            'repeat(' + this.props.sheet.totalRows + ', [row-start] 1fr)';
         return {
            gridTemplateColumns: columnsStyle,
            gridTemplateRows: rowsStyle,
         };
      }
   }
}

function mapStateToProps(state) {
   return {
      sheet: state.sheet,
      managedStore,
      cellKeys: state.cellKeys,
      sheetId: state.sheetId,
   };
}

export default connect(
   mapStateToProps,
   {
      fetchedSheet,
      updatedSheetId,
      updatedCellKeys,
   }
)(Sheet);
