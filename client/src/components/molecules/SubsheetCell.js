import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchSummaryCellFromSheet } from '../../services/sheetServices';
import { loadSheet } from '../../services/sheetServices';

class SubsheetCell extends Component {
   render() {
      return (
         <div
            className="grid-item border border-burnt-orange cursor-pointer"
            onClick={() => loadSheet(this.props.subSheetId)}
         >
            <div>{this.props.subContent}</div>
         </div>
      );
   }
}

function mapStateToProps(state, ownProps) {
   return {
      subContent: ownProps.cell.content.subContent,
      subSheetId: ownProps.cell.content.subSheetId,
   };
}

export default connect(
   mapStateToProps,
   { fetchSummaryCellFromSheet }
)(SubsheetCell);
