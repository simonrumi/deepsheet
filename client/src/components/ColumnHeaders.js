import React, { Component } from 'react';
import { when } from 'ramda';
import { connect } from 'react-redux';
import managedStore from '../store';
import { indexToColumnLetter } from '../helpers';
import FilterModal from './FilterModal';
import { COLUMN_HEADER_HEIGHT } from '../helpers/constants';

class ColumnHeaders extends Component {
   constructor(props) {
      super(props);
      this.indexToColumnLetter = indexToColumnLetter.bind(this);
      this.showFilterModal = this.showFilterModal.bind(this);
   }

   render() {
      const headers = this.renderColumnHeaders();
      return (
         <div
            className="grid-container"
            style={this.renderGridSizingStyle(1, this.props.sheet.totalColumns)}
         >
            {this.outputHeaders(headers)}
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
                  className="grid-header-item grey-blue top left border"
                  style={{ height: COLUMN_HEADER_HEIGHT }}
                  key="topCorner"
               ></div>
            );
         }

         // add the column header with the letter of that column in it
         const name = indexToNameFn(currentIndex);
         const rightBorder =
            currentIndex === this.props.sheet.totalColumns - 1 ? 'right' : '';
         const classes =
            'grid-header-item grey-blue top left ' + rightBorder + ' border';
         headers.push(
            <div
               key={name}
               className={classes}
               data-testid={'col' + currentIndex}
            >
               {name}{' '}
               <i
                  className="grey-blue small filter icon pointer"
                  onClick={this.showFilterModal}
               />
            </div>
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

   showFilterModal() {
      console.log('showing filter modal');
      return <FilterModal />;
   }

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
      managedStore,
   };
}

export default connect(
   mapStateToProps,
   {}
)(ColumnHeaders);
