import React, { Component } from 'react';
import * as R from 'ramda';
import { connect } from 'react-redux';
import { loadSheet } from '../../services/sheetServices';
import { menuHidden } from '../../actions/menuActions';
import { focusedCell, deleteSubsheetId } from '../../actions/cellActions';
import { cellColumn, cellRow, cellText, cellIsCallingDb, stateSheetId } from '../../helpers/dataStructureHelpers';
import { isCellFocused } from '../../helpers/cellHelpers';
import IconDownToSubsheet from '../atoms/IconDownToSubsheet';
import IconUnlinkSubsheet from '../atoms/IconUnlinkSubsheet';
import IconLoading from '../atoms/IconLoading';

class SubsheetCell extends Component {
   constructor(props) {
      super(props);
      this.onCellClick = this.onCellClick.bind(this);
      this.renderIcons = this.renderIcons.bind(this);
      this.renderIconDownToSubsheet = this.renderIconDownToSubsheet.bind(this);
      this.renderIconUnlinkSubsheet = this.renderIconUnlinkSubsheet.bind(this);
      this.unlinkSubsheet = this.unlinkSubsheet.bind(this);
   }

   async unlinkSubsheet() {
      const row = cellRow(this.props.cell);
      const column = cellColumn(this.props.cell);
      const text = cellText(this.props.cell);
      R.pipe(stateSheetId, deleteSubsheetId(row, column, text))(this.props.state);
   }

   renderIconUnlinkSubsheet() {
      /* onMouseDown is fired before onBlur, whereas onClick is after onBlur. 
         Since the Editor may have the focus when a cell is clicked, clicking on IconNewDoc will cause
         the Editor's onBlur to fire...but we need to call another action before the onBlur,
         hence the use of onMouseDown */
      return <IconUnlinkSubsheet classes="w-4 flex-1" onMouseDownFn={this.unlinkSubsheet} />;
   }

   renderIconDownToSubsheet() {
      /* onMouseDown is fired before onBlur, whereas onClick is after onBlur. 
         Since the Editor may have the focus when a cell is clicked, clicking on IconNewDoc will cause
         the Editor's onBlur to fire...but we need to call another action before the onBlur,
         hence the use of onMouseDown */
      return (
         <IconDownToSubsheet
            classes="w-4 flex-1 mr-2"
            onMouseDownFn={() => {
               loadSheet(this.props.state, this.props.subsheetId);
            }}
         />
      );
   }

   renderIcons(cellHasFocus) {
      if (cellIsCallingDb(this.props.cell)) {
         return (
            <div className="relative w-full">
               <div className="absolute bottom-4 left-0 z-10 min-w-full flex justify-start">
                  <IconLoading classes="w-4 flex-1" />
               </div>
            </div>
         );
      }
      if (cellHasFocus) {
         return (
            <div className="relative w-full">
               <div className="absolute bottom-4 left-0 z-10 min-w-full flex justify-start">
                  {this.renderIconDownToSubsheet()}
                  {this.renderIconUnlinkSubsheet()}
               </div>
            </div>
         );
      }
      return null;
   }

   onCellClick(evt) {
      evt.preventDefault();
      this.props.focusedCell(this.props.cell);
      this.props.menuHidden(); // in case the menu was showing, hide it
   }

   innerDivClassNames = cellHasFocus => {
      const cellBaseClasses = 'm-px p-px ';
      const borderClasses = cellHasFocus ? 'border-2 border-subdued-blue' : 'border border-burnt-orange';
      return cellBaseClasses + borderClasses;
   };

   render() {
      const cellHasFocus = isCellFocused(this.props.cell, this.props.state);
      return (
         <div
            className="grid-item grid items-stretch cursor-pointer border-t border-l"
            onClick={evt => this.onCellClick(evt)}>
            <div className={this.innerDivClassNames(cellHasFocus)}>
               {this.renderIcons(cellHasFocus)}
               {this.props.subContent}
            </div>
         </div>
      );
      // note the class grid-item makes this cell an item within the large grid which is the spreadsheet
      // while these classes create a 1x1 grid that takes up the full space within that:
      // grid items-stretch
      // In the inner div there is the text, with m-px giving a 1px margin so its orange border is a little separated from the outer div's grey border
   }
}

function mapStateToProps(state, ownProps) {
   return {
      state,
      subContent: ownProps.cell.content.text,
      subsheetId: ownProps.cell.content.subsheetId,
      cell: ownProps.cell,
   };
}

export default connect(mapStateToProps, { menuHidden, focusedCell, deleteSubsheetId })(SubsheetCell);
