import * as R from 'ramda';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Header from './Header';
import Editor from './Editor';
import ColumnHeaders from './organisms/ColumnHeaders';
import RowHeader from './molecules/RowHeader';
import LastRow from './organisms/LastRow';
import Cell from './molecules/Cell';
import FilterModal from './organisms/FilterModal';
import { fetchedSheet, updatedSheetId } from '../actions';
import managedStore from '../store';
import {
   nothing,
   ROW_AXIS,
   COLUMN_AXIS,
   THIN_COLUMN,
   ROW_HEIGHT,
} from '../helpers';
import {
   shouldShowRow,
   isFirstColumn,
   isLastVisibleItemInAxis,
   getRequiredNumItemsForAxis,
} from '../helpers/visibilityHelpers';
// import * as RWrap from '../helpers/ramdaWrappers'; // use this for debugging only

// *** TODO: in this order
// add additional columns
// add additional rows
// move columns
// move rows
// sort columns
// sort rows

class Sheet extends Component {
   componentDidMount() {
      this.props.updatedSheetId(this.props.sheetId);
   }

   renderEmptyEndCell = cellKey => (
      <Cell blankCell={true} cellKey={cellKey} key={cellKey + '_endCell'} />
   );

   maybeEmptyEndCell = cellKey =>
      R.ifElse(
         isLastVisibleItemInAxis(
            COLUMN_AXIS, // we are rendering a row, so need to check if this is the last visible column in the row
            this.props.sheet.totalColumns,
            this.props.sheet
         ),
         this.renderEmptyEndCell,
         nothing
      )(cellKey);

   renderRowHeader = cellKey => (
      <RowHeader cellKey={cellKey} key={'row_header_' + cellKey} />
   );

   renderCell = cellKey => <Cell cellKey={cellKey} key={cellKey} />;

   maybeRowHeader = R.ifElse(isFirstColumn, this.renderRowHeader, nothing);

   renderRow = cellKey => {
      return [
         this.maybeRowHeader(cellKey),
         this.renderCell(cellKey),
         this.maybeEmptyEndCell(cellKey),
      ];
   };

   maybeRow = sheet => R.ifElse(shouldShowRow(sheet), this.renderRow, nothing);

   renderCells() {
      if (
         R.has('totalRows', this.props.sheet) &&
         this.props.cellKeys &&
         this.props.cellKeys.length > 0 &&
         this.props.sheetId === this.props.sheet._id
      ) {
         const rows = R.map(
            this.maybeRow(this.props.sheet),
            this.props.cellKeys
         );

         // ****TODO - prepend the header row here!!!
         //const rowsWithHeader = R.prepend()

         return R.append(<LastRow key="lastRow" />, rows);
      }
      return <div>loading...</div>;
   }

   columnHeaderStyle = colSpan => {
      return {
         gridColumn: colSpan,
         gridRow: 'span 1',
         width: '100%',
         height: '100%',
         padding: 0,
      };
   };

   createColSpan = colNum => 'span ' + (colNum + 2); //need 2 extra columns for the row headers on the left and the column adder on the right

   getGridSizingStyle([numRows, numCols]) {
      const rowsStyle =
         ROW_HEIGHT + ' repeat(' + numRows + ', 1fr) ' + ROW_HEIGHT;
      const columnsStyle =
         THIN_COLUMN + ' repeat(' + numCols + ', 1fr) ' + THIN_COLUMN;
      return {
         gridTemplateRows: rowsStyle,
         gridTemplateColumns: columnsStyle,
      };
   }

   renderColHeaderStyle = R.pipe(
      getRequiredNumItemsForAxis,
      this.createColSpan,
      this.columnHeaderStyle
   );

   renderGridSizingStyle = sheet =>
      this.getGridSizingStyle(
         R.map(getRequiredNumItemsForAxis(R.__, sheet), [ROW_AXIS, COLUMN_AXIS])
      );

   maybeRenderFilterModal = showFilterModal =>
      showFilterModal ? <FilterModal /> : null;

   render() {
      return (
         <div className="px-1">
            <Header />
            <Editor />
            {this.maybeRenderFilterModal(this.props.showFilterModal)}
            <div
               className="grid-container"
               style={this.renderGridSizingStyle(this.props.sheet)}
            >
               {/******* remove header from here....trying to put it in rencderCells above */}
               <div
                  className="grid-item"
                  style={this.renderColHeaderStyle(
                     COLUMN_AXIS,
                     this.props.sheet
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
}

function mapStateToProps(state) {
   return {
      sheet: state.sheet,
      showFilterModal: state.filterModal.showFilterModal,
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
   }
)(Sheet);
