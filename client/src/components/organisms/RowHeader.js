import React, { Component } from 'react';
import { connect } from 'react-redux';
import { cellRow } from '../../helpers/dataStructureHelpers';
import RowDropTarget from '../molecules/RowDropTarget';
import RowHeaderDetail from '../molecules/RowHeaderDetail';

class RowHeader extends Component {
   render() {
      const row = cellRow(this.props.cell);
      return (
         <div className="flex flex-col justify-between h-full border-t border-l">
            <RowHeaderDetail cell={this.props.cell} />
            <RowDropTarget key={'rowDropTarget_' + row} rowIndex={row} classes="w-full self-end cursor-row-resize" />
         </div>
      );
   }
}

function mapStateToProps(state, ownProps) {
   return {
      showFilterModal: state.showFilterModal,
      cell: ownProps.cell,
   };
}

export default connect(mapStateToProps)(RowHeader);
