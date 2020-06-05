import React, { Component } from 'react';
import * as R from 'ramda';
import { connect } from 'react-redux';
import { shouldShowColumn } from '../../helpers/visibilityHelpers';
import ColumnHeader from '../molecules/ColumnHeader';
import TopLeftHeader from '../atoms/TopLeftHeader';
import ColumnAdder from '../molecules/ColumnAdder';

const COLUMN_HEADER_CLASSES =
   'grid-header-item text-grey-blue border-t border-l h-12';

class ColumnHeaders extends Component {
   constructor(props) {
      super(props);
      this.renderColumnHeaders = this.renderColumnHeaders.bind(this);
   }

   checkHeaders = (headers) =>
      headers instanceof Array && headers.length > 0 ? true : false;
   outputHeaders = (arr) => R.when(this.checkHeaders, R.identity, arr);

   renderColumnHeaders() {
      if (!this.props.totalColumns) {
         return null;
      }

      // recursive function to render a row of spreadeheet column headers A, B, C... etc
      const generateHeaders = (
         totalHeaders,
         currentIndex = 0,
         headers = []
      ) => {
         //return the headers when we've finished creating all of them
         if (totalHeaders === currentIndex) {
            return headers;
         }

         // before the very first column we need to add a spacer column that will go above the row headers
         if (currentIndex === 0) {
            headers.push(
               <TopLeftHeader
                  classes={COLUMN_HEADER_CLASSES}
                  key="topLeftCorner"
               />
            );
         }

         if (shouldShowColumn(this.props.columnVisibility, currentIndex)) {
            headers.push(
               <ColumnHeader
                  index={currentIndex}
                  key={'col' + currentIndex}
                  classes={COLUMN_HEADER_CLASSES}
               />
            );
         }

         //after the last column add a "+" to allow adding more columns
         if (currentIndex === this.props.totalColumns - 1) {
            headers.push(
               <ColumnAdder key="columnAdder" classes={COLUMN_HEADER_CLASSES} />
            );
         }

         return generateHeaders(totalHeaders, ++currentIndex, headers);
      };
      return generateHeaders(this.props.totalColumns);
   }

   render() {
      const headers = this.renderColumnHeaders();
      return this.outputHeaders(headers);
   }
}

function mapStateToProps(state) {
   return {
      sheet: state.sheet,
      totalColumns: state.sheet.totalColumns,
      columnVisibility: state.sheet.columnVisibility,
   };
}

export default connect(mapStateToProps)(ColumnHeaders);
