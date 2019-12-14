import React, { Component } from 'react';
import { when } from 'ramda';
import { connect } from 'react-redux';
import managedStore from '../store';
import { indexToColumnLetter } from '../helpers';
import { toggledShowFilterModal } from '../actions';
import ColumnHeader from './molecules/ColumnHeader';
import FilterModal from './FilterModal';

const COLUMN_HEADER_HEIGHT = '2em';

class ColumnHeaders extends Component {
   constructor(props) {
      super(props);
      this.indexToColumnLetter = indexToColumnLetter.bind(this);
   }

   render() {
      const headers = this.renderColumnHeaders();
      return (
         <div
            className="grid-container mt-2"
            style={this.renderGridSizingStyle(1, this.props.sheet.totalColumns)}
         >
            {this.outputHeaders(headers)}
            <FilterModal />
         </div>
      );
   }

   // recursive function to render a row of spreadeheet column headers A, B, C... etc
   renderColumnHeaders() {
      if (!this.props.sheet.totalColumns) {
         return null;
      }
      const generateHeaders = (
         totalHeaders,
         indexToNameFn,
         currentIndex = 0,
         headers = []
      ) => {
         //return all the headers when we've reached the end
         if (totalHeaders === currentIndex) {
            return headers;
         }

         // before the very first column we need a spacer column that will go above the row headers
         if (currentIndex === 0) {
            headers.push(
               <div
                  className="grid-header-item text-grey-blue border-t border-l"
                  style={{ height: COLUMN_HEADER_HEIGHT }}
                  key="topCorner"
               ></div>
            );
         }

         headers.push(
            <ColumnHeader
               index={currentIndex}
               key={'col' + currentIndex}
               totalColumns={this.props.sheet.totalColumns}
               onFilterClick={() => this.props.toggledShowFilterModal(true)}
            />
         );
         return generateHeaders(
            totalHeaders,
            indexToNameFn,
            ++currentIndex,
            headers
         );
      };
      return generateHeaders(
         this.props.sheet.totalColumns,
         this.indexToColumnLetter
      );
   }

   checkHeaders = headers =>
      headers instanceof Array && headers.length > 0 ? true : false;
   identity = value => value;
   outputHeaders = arr => when(this.checkHeaders, this.identity, arr);

   renderGridSizingStyle(numRows, numCols) {
      const rowsStyle = 'repeat(' + numRows + ', 1.5em)';
      const columnsStyle = '2em repeat(' + numCols + ', 1fr)';
      return {
         gridTemplateRows: rowsStyle,
         gridTemplateColumns: columnsStyle,
      };
   }
}

function mapStateToProps(state) {
   return {
      sheet: state.sheet,
      showFilterModal: state.showFilterModal,
      managedStore,
   };
}

export default connect(
   mapStateToProps,
   { toggledShowFilterModal }
)(ColumnHeaders);
