import React, { Component } from 'react';
import { connect } from 'react-redux';
import { loadSheet } from '../../services/sheetServices';

class SubsheetCell extends Component {
   render() {
      return (
         <div
            className="grid-item border border-burnt-orange cursor-pointer"
            onClick={() => {
               loadSheet(this.props.state, this.props.subsheetId);
            }}>
            <div>{this.props.subContent}</div>
         </div>
      );
   }
}

function mapStateToProps(state, ownProps) {
   return {
      state,
      subContent: ownProps.cell.content.text,
      subsheetId: ownProps.cell.content.subsheetId,
   };
}

export default connect(mapStateToProps)(SubsheetCell);
