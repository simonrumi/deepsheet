import * as R from 'ramda';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { triggeredFetchSheet } from '../actions/fetchSheetActions';

import { nothing, isSomething } from '../helpers';
import { stateTotalRows, stateTotalColumns, stateIsLoggedIn, stateSheetId } from '../helpers/dataStructureHelpers';
import {
   shouldShowRow,
   isFirstColumn,
   isLastVisibleItemInAxis,
   getRequiredNumItemsForAxis,
} from '../helpers/visibilityHelpers';
import { getUserInfoFromCookie } from '../helpers/userHelpers';
import { stateRowVisibility } from '../helpers/dataStructureHelpers';
import { ROW_AXIS, COLUMN_AXIS, THIN_COLUMN, ROW_HEIGHT } from '../constants';

import LoadingIcon from './atoms/IconLoading';
import Header from './Header';
import Editor from './organisms/Editor';
import ColumnHeaders from './organisms/ColumnHeaders';
import RowHeader from './organisms/RowHeader';
import LastRow from './organisms/LastRow';
import Cell from './molecules/Cell';
import FilterModal from './organisms/FilterModal';
import LoginModal from './organisms/LoginModal';
import managedStore from  '../store';

class Sheet extends Component {
   renderEmptyEndCell = cellKey => (
      <Cell blankCell={true} cellKey={cellKey} classes={'border-r'} key={cellKey + '_endCell'} />
   );

   maybeEmptyEndCell = cellKey =>
      R.ifElse(
         isLastVisibleItemInAxis(
            COLUMN_AXIS, // we are rendering a row, so need to check if this is the last visible column in the row
            stateTotalColumns(managedStore.state),
            managedStore.state
         ),
         this.renderEmptyEndCell,
         nothing
      )(cellKey);

   renderRowHeader = cellKey => <RowHeader cellKey={cellKey} blankCell={false} key={'row_header_' + cellKey} />;

   renderCell = cellKey => <Cell cellKey={cellKey} blankCell={false} key={cellKey} />;

   maybeRowHeader = R.ifElse(isFirstColumn, this.renderRowHeader, nothing);

   renderCellAndMaybeEdges = cellKey => {
      return [this.maybeRowHeader(cellKey), this.renderCell(cellKey), this.maybeEmptyEndCell(cellKey)];
   };

   maybeCell = () => R.ifElse(shouldShowRow(stateRowVisibility(managedStore.state)), this.renderCellAndMaybeEdges, nothing);

   renderCells = () => {
      if (isSomething(stateTotalRows(managedStore.state)) && this.props.cellKeys && this.props.cellKeys.length > 0) {
         return R.pipe(
            R.map(cellKey => this.maybeCell(managedStore.state)(cellKey)), // R.map(cellKey => this.maybeCell(this.props.st*te)(cellKey)),
            R.prepend(<ColumnHeaders key="columnHeaders" />),
            R.append(<LastRow key="lastRow" />)
         )(this.props.cellKeys);
      }
   };

   maybeRenderLogin = () => {
      const { userId, sessionId } = getUserInfoFromCookie();
     if (stateIsLoggedIn(managedStore.state) === false || !userId || !sessionId) {
         return <LoginModal />;
      }
      
      if (!stateSheetId(managedStore.state)) {
         triggeredFetchSheet();
      }
      return null;
   };

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
      const rowsStyle = ROW_HEIGHT + ' repeat(' + numRows + ', minmax(0, 1fr)) ' + ROW_HEIGHT;
      const columnsStyle = THIN_COLUMN + ' repeat(' + numCols + ', minmax(0, 1fr)) ' + THIN_COLUMN;
      return {
         gridTemplateRows: rowsStyle,
         gridTemplateColumns: columnsStyle,
      };
   }

   // TODO this function might be getting the wrong info
   renderGridSizingStyle = () =>
      this.getGridSizingStyle(R.map(getRequiredNumItemsForAxis(R.__, managedStore.state), [ROW_AXIS, COLUMN_AXIS]));

   maybeRenderFilterModal = showFilterModal => (showFilterModal ? <FilterModal /> : null);

   render() {
      if (this.props.sheetId && this.props.sheetId.isCallingDb) {
         return (
            <div className="m-auto max-w-md">
               <LoadingIcon />
            </div>
         );
      }
      return (
         <div className="px-1">
            <Header />
            <Editor cellContent="" />
            {this.maybeRenderFilterModal(this.props.showFilterModal)}
            {this.maybeRenderLogin(/* this.props.st*te */)}
            <DndProvider backend={HTML5Backend}>
               <div className="grid-container pt-1" style={this.renderGridSizingStyle(/* this.props.st*te */)}>
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
      cellKeys: state.cellKeys,
      sheetId: state.sheetId,
   };
}
export default connect(mapStateToProps, {
   triggeredFetchSheet,
})(Sheet);
