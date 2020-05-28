import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toggledShowFilterModal } from '../../actions';
import ColumnHeaderDetail from './ColumnHeaderDetail';
import ColumnDropTarget from './ColumnDropTarget';

class ColumnHeader extends Component {
   render() {
      return (
         <div className="flex flex-row justify-between w-full h-full border-t border-l p-0">
            <ColumnHeaderDetail index={this.props.index} />
            <ColumnDropTarget
               key={'columnDropTarget_' + this.props.index}
               columnIndex={this.props.index}
               classes="w-1 h-full self-end cursor-row-resize"
            />
         </div>
      );
   }
}

function mapStateToProps(state, ownProps) {
   return {
      showFilterModal: state.showFilterModal,
      index: ownProps.index,
      classes: ownProps.classes,
   };
}

export default connect(mapStateToProps, { toggledShowFilterModal })(
   ColumnHeader
);
