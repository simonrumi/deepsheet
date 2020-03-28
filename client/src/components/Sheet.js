import * as R from 'ramda';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Header from './Header';
import Editor from './Editor';
import ColumnHeaders from './organisms/ColumnHeaders';
import RowHeader from './organisms/RowHeader';
import LastRow from './organisms/LastRow';
import Cell from './molecules/Cell';
import FilterModal from './organisms/FilterModal';
import { fetchedSheet, updatedSheetId } from '../actions';
import managedStore from '../store';
import { nothing } from '../helpers';
import { ROW_AXIS, COLUMN_AXIS, THIN_COLUMN, ROW_HEIGHT } from '../constants';
import {
   shouldShowRow,
   isFirstColumn,
   isLastVisibleItemInAxis,
   getRequiredNumItemsForAxis,
} from '../helpers/visibilityHelpers';
// import * as RWrap from '../helpers/ramdaWrappers'; // use this for debugging only

class Sheet extends Component {
   componentDidMount() {
      this.props.updatedSheetId(this.props.sheetId);
   }

   renderEmptyEndCell = cellKey => (
      <Cell
         blankCell={true}
         cellKey={cellKey}
         classes={'border-r'}
         key={cellKey + '_endCell'}
      />
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
         const rows = R.map(cellKey => {
            const value = this.maybeRow(this.props.sheet)(cellKey);
            return this.maybeRow(this.props.sheet)(cellKey);
         }, this.props.cellKeys);
         const rowsWithColumnHeaders = R.prepend(
            <ColumnHeaders key="columnHeaders" />,
            rows
         );
         return R.append(<LastRow key="lastRow" />, rowsWithColumnHeaders);
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

   createColumnHeaderSpan = colNum => 'span ' + (colNum + 3); //need 3 extra columns for the 2 row header cols on the left and the column adder on the right

   // TODO this will need to be manipulated to create different sized columns and rows
   // to see the reason for using minmax see https://css-tricks.com/preventing-a-grid-blowout/
   getGridSizingStyle([numRows, numCols]) {
      const rowsStyle =
         ROW_HEIGHT + ' repeat(' + numRows + ', minmax(0, 1fr)) ' + ROW_HEIGHT;
      const columnsStyle =
         THIN_COLUMN +
         ' repeat(' +
         numCols +
         ', minmax(0, 1fr)) ' +
         THIN_COLUMN;
      return {
         gridTemplateRows: rowsStyle,
         gridTemplateColumns: columnsStyle,
      };
   }

   renderColHeaderStyle = R.pipe(
      getRequiredNumItemsForAxis,
      this.createColumnHeaderSpan,
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
            <DndProvider backend={HTML5Backend}>
               <div
                  className="grid-container pt-1"
                  style={this.renderGridSizingStyle(this.props.sheet)}
               >
                  {this.renderCells()}
               </div>
            </DndProvider>
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
