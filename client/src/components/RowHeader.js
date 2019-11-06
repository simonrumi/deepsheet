import React, { Component } from 'react';
import { connect } from 'react-redux';
import { indexToRowNumber } from '../helpers';

class RowHeader extends Component {
   constructor(props) {
      super(props);
      this.indexToRowNumber = indexToRowNumber.bind(this);
   }

   render() {
      return this.renderRowHeader(this.props.cellKey);
   }

   renderRowHeader(cellKey) {
      const rowRegex = /cell_(\d+)_\d+$/;
      const rowIndex = rowRegex.exec(cellKey)[1]; // [1] returns the first group captured in the regex
      const rowNum = this.indexToRowNumber(rowIndex);
      let classNames = 'grid-header-item row-header-item grey-blue top left ';
      if (rowNum === this.props.totalRows) {
         classNames += 'bottom ';
      }
      classNames += 'border';
      return (
         <div className={classNames}>
            {rowNum}
            <i
               data-testid={'row' + rowNum}
               className="grey-blue small filter icon pointer"
               onClick={event => (event.target.innerHTML = 'todo')}
            />
         </div>
      );
   }
}

function mapStateToProps(state, ownProps) {
   return {
      cellKey: ownProps.cellKey,
      totalRows: state.sheet.totalRows,
   };
}

export default connect(
   mapStateToProps,
   {}
)(RowHeader);
