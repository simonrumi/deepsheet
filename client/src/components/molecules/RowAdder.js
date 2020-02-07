import React, { Component } from 'react';
import { connect } from 'react-redux';
import IconAdd from '../atoms/IconAdd';

class RowAdder extends Component {
   render() {
      return (
         <div className={this.props.classes} data-testid="rowAdder">
            <div className="flex items-center px-2 py-2">
               <IconAdd
                  classes={'flex-1 h-3 w-3'}
                  onClickFn={() => alert('TODO: add row')}
               />
            </div>
         </div>
      );
   }
}

function mapStateToProps(state, ownProps) {
   return {
      classes: ownProps.classes,
   };
}

export default connect(mapStateToProps)(RowAdder);
