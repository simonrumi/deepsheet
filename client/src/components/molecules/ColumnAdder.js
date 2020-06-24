import React, { Component } from 'react';
import { connect } from 'react-redux';
import insertNewColumn from '../../services/insertNewColumn';
import IconAdd from '../atoms/IconAdd';

class ColumnAdder extends Component {
   render() {
      const allClasses = this.props.classes + ' border-r';
      return (
         <div className={allClasses} data-testid="columnAdder">
            <div className="flex items-center px-2 py-1">
               <IconAdd
                  classes={'flex-1 h-3 w-3'}
                  onClickFn={() => insertNewColumn(this.props.cellKeys, this.props.state)}
               />
            </div>
         </div>
      );
   }
}

function mapStateToProps(state, ownProps) {
   return {
      state,
      sheet: state.sheet,
      cellKeys: state.cellKeys,
      classes: ownProps.classes,
   };
}

export default connect(mapStateToProps)(ColumnAdder);
