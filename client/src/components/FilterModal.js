import React, { Component } from 'react';
import { connect } from 'react-redux';

class FilterModal extends Component {
   render() {
      return <div className="filter-modal">filter modal</div>;
   }
}

function mapStateToProps(state, ownProps) {
   return {
      sheet: state.sheet, // might not really need this
   };
}

export default connect(
   mapStateToProps,
   {}
)(FilterModal);
