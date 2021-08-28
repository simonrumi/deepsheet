import React, { Component } from 'react';
import * as R from 'ramda';
import { connect } from 'react-redux';
import { shouldShowColumn } from '../../helpers/visibilityHelpers';
import { stateTotalColumns, stateColumnVisibility } from '../../helpers/dataStructureHelpers';
import ColumnHeader from './ColumnHeader';
import TopLeftHeader from '../atoms/TopLeftHeader';
import ColumnAdder from '../molecules/ColumnAdder';

const COLUMN_HEADER_CLASSES = 'col-span-1 row-span-1 w-full h-full p-0.5 align-middle text-center text-grey-blue border-t border-l';

class ColumnHeaders extends Component {
   constructor(props) {
      super(props);
      this.renderColumnHeaders = this.renderColumnHeaders.bind(this);
   }

   checkHeaders = headers => (headers instanceof Array && headers.length > 0 ? true : false);
   outputHeaders = arr => R.when(this.checkHeaders, R.identity, arr);

   renderColumnHeaders() {
      if (!stateTotalColumns(this.props.state)) {
         return null;
      }

      // recursive function to render a row of spreadeheet column headers A, B, C... etc
      const generateHeaders = (totalHeaders, currentIndex = 0, headers = []) => {
         //return the headers when we've finished creating all of them
         if (totalHeaders === currentIndex) {
            return headers;
         }

         // before the very first column we need to add a spacer column that will go above the row headers
         if (currentIndex === 0) {
            headers.push(<TopLeftHeader classes={COLUMN_HEADER_CLASSES} key="topLeftCorner" />);
         }

         if (shouldShowColumn(stateColumnVisibility(this.props.state), currentIndex)) {
            headers.push(
               <ColumnHeader index={currentIndex} key={'col' + currentIndex} classes={COLUMN_HEADER_CLASSES} />
            );
         }

         //after the last column add a "+" to allow adding more columns
         if (currentIndex === stateTotalColumns(this.props.state) - 1) {
            headers.push(<ColumnAdder key="columnAdder" classes={COLUMN_HEADER_CLASSES} />);
         }

         return generateHeaders(totalHeaders, ++currentIndex, headers);
      };
      return R.pipe(stateTotalColumns, generateHeaders)(this.props.state);
   }

   render() {
      const headers = this.renderColumnHeaders();
      return this.outputHeaders(headers);
   }
}

function mapStateToProps(state) {
   return { state };
}

export default connect(mapStateToProps)(ColumnHeaders);
