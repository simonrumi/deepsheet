import React, { Component } from 'react';
import { connect } from 'react-redux';
import { stateFrozenColumns } from '../../helpers/dataStructureHelpers';
import { getObjectFromArrayByKeyValue } from '../../helpers';
import ColumnHeaderDetail from './ColumnHeaderDetail';
import ColumnDropTarget from './ColumnDropTarget';

class ColumnHeader extends Component {
   render() {
      const columnFrozen = getObjectFromArrayByKeyValue('index', this.props.index, this.props.frozenColumns);
      return (
         <div className="flex flex-row justify-between w-full h-full border-t border-l p-0">
            <ColumnHeaderDetail index={this.props.index} frozen={columnFrozen?.isFrozen || false} />
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
      frozenColumns: stateFrozenColumns(state),
   };
}
export default connect(mapStateToProps)(
   ColumnHeader
);

/* older version
export default connect(mapStateToProps, { toggledShowFilterModal })(
   ColumnHeader
); */
