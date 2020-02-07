import React, { Component } from 'react';
import * as R from 'ramda';
import { connect } from 'react-redux';
import RowAdder from '../molecules/RowAdder';
import IconFilter from '../atoms/IconFilter';

class LastRow extends Component {
   generateKey = num => 'lastRow_' + num;

   makeLastRowArray = (totalColumns, index = 0, cells = []) => {
      if (index === totalColumns) {
         return cells;
      }
      if (index === 0) {
         return R.prepend(
            <RowAdder
               key="rowAdder"
               classes="grid-item text-dark-dark-blue border-b border-l border-r"
            />,
            this.makeLastRowArray(totalColumns, index + 1, cells)
         );
      } else {
         return R.prepend(
            <div
               className="grid-item border-b border-r"
               key={this.generateKey(index)}
            ></div>,
            this.makeLastRowArray(totalColumns, index + 1, cells)
         );
      }
   };

   render() {
      return this.makeLastRowArray(this.props.totalColumns + 2);
   }
}

function mapStateToProps(state, ownProps) {
   return {
      sheet: state.sheet,
      totalColumns: state.sheet.totalColumns,
      columnVisibility: state.sheet.columnVisibility,
   };
}

export default connect(mapStateToProps)(LastRow);
