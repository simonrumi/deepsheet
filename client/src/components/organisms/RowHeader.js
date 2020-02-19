import React, { Component } from 'react';
import { connect } from 'react-redux';
import { extractRowColFromCellKey } from '../../helpers';

import RowDropTarget from '../molecules/RowDropTarget';
import RowHeaderDetail from '../molecules/RowHeaderDetail';

class RowHeader extends Component {
   render() {
      const { row } = extractRowColFromCellKey(this.props.cellKey);
      return (
         <div className="flex flex-col justify-between h-full border-t border-l">
            <RowHeaderDetail cellKey={this.props.cellKey} />
            <RowDropTarget
               key={'rowDropTarget_' + row}
               rowIndex={row}
               classes="w-full self-end cursor-row-resize"
            />
         </div>
      );
   }
}

function mapStateToProps(state, ownProps) {
   return {
      showFilterModal: state.showFilterModal,
      cellKey: ownProps.cellKey,
      totalRows: state.sheet.totalRows,
      rowFilters: state.sheet.rowFilters,
   };
}

export default connect(mapStateToProps)(RowHeader);
