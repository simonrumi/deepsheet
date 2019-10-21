import { map, ifElse } from 'ramda';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Header from './Header';
import Editor from './Editor';
import ColumnHeaders from './ColumnHeaders';
import RowHeader from './RowHeader';
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
            <div
               className="grid-container"
               style={this.renderGridSizingStyle(
                  this.props.sheet.totalRows,
                  this.props.sheet.totalColumns
               )}
            >
               <div
                  className="grid-item"
                  style={this.renderGridColHeaderStyle(
                     this.props.sheet.totalColumns
                  )}
               >
                  <ColumnHeaders />
               </div>
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
         return map(cellKey => {
            return [this.maybeRowHeader(cellKey), this.renderCell(cellKey)];
         }, this.props.cellKeys);
      }
      return <div>loading...</div>;
   }

   isFirstColumn = cellKey => /.*_0$/.test(cellKey);
   renderRowHeader = cellKey => (
      <RowHeader cellKey={cellKey} key={'row_header_' + cellKey} />
   );
   renderCell = cellKey => <Cell cellKey={cellKey} key={cellKey} />;
   noHeader = () => null;
   maybeRowHeader = ifElse(
      this.isFirstColumn,
      this.renderRowHeader,
      this.noHeader
   );

   renderGridSizingStyle(numRows, numCols) {
      const headerRowHeight = '2em';
      const headerColHeight = '2em';
      const rowsStyle = headerRowHeight + ' repeat(' + numRows + ', 1fr)';
      const columnsStyle = headerColHeight + ' repeat(' + numCols + ', 1fr)';
      return {
         gridTemplateRows: rowsStyle,
         gridTemplateColumns: columnsStyle,
      };
   }

   renderGridColHeaderStyle(colNum) {
      const colSpan = 'span ' + (colNum + 1); //need an extra column for the row headers on the left
      return {
         gridColumn: colSpan,
         gridRow: 'span 1',
         width: '100%',
         height: '100%',
         padding: 0,
      };
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
