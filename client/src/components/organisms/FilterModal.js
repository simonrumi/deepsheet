import React, { Component } from 'react';
import { connect } from 'react-redux';
import { menuHidden } from '../../actions/menuActions';
import SortOptions from '../molecules/SortOptions';
import FilterOptions from '../molecules/FilterOptions';
import FilterModalHeading from '../molecules/FilterModalHeading';
import { stateShowFilterModal, stateFilterRowIndex, stateFilterColumnIndex } from '../../helpers/dataStructureHelpers';

class FilterModal extends Component {
   render() {
      if (this.props.showFilterModal) {
         window.setTimeout(this.props.menuHidden, 0); // setTimeout makes this happen 1 tick after the render, to avoid console error
         return (
            <div className="fixed z-20 top-0 mt-4 left-1/3 w-1/2 md:w-1/3 border border-solid border-grey-blue bg-white shadow-lg px-2 py-2">
               <FilterModalHeading />
               <SortOptions
                  classes=""
                  className="fixed z-20 top-0 mt-4 left-1/3 w-1/2 md:w-1/3 border border-solid border-grey-blue bg-white shadow-lg px-2 py-2"
                  rowIndex={this.props.rowIndex}
                  colIndex={this.props.columnIndex}
               />
               <FilterOptions />
            </div>
         );
      }
      return null;
   }
}

function mapStateToProps(state, ownProps) {
   return {
      showFilterModal: stateShowFilterModal(state),
      rowIndex: stateFilterRowIndex(state),
      columnIndex: stateFilterColumnIndex(state),
   };
}

export default connect(mapStateToProps, { menuHidden })(FilterModal);
