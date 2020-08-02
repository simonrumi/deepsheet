import React, { Component } from 'react';
import * as R from 'ramda';
import { connect } from 'react-redux';
import IconMenu from '../atoms/IconMenu';
import IconClose from '../atoms/IconClose';
import IconLoading from '../atoms/IconLoading';
import { menuSaveText, menuNewSheetText, menuSheetsText } from '../displayText';
import { menuShown, menuHidden } from '../../actions/menuActions';
import { createdSheet } from '../../actions/sheetActions';
import { isSomething, arrayContainsSomething } from '../../helpers';
import {
   stateIsStale,
   stateIsCallingDb,
   stateShowMenu,
   stateSheets,
   stateSheetsIsCallingDb,
   stateSheetsErrorMessage,
} from '../../helpers/dataStructureHelpers';
import { saveAllUpdates, fetchSheets } from '../../services/sheetServices';
import { buildSheetsTree } from '../../helpers/sheetsHelpers';

class Menu extends Component {
   constructor(props) {
      super(props);
      this.handleSave = this.handleSave.bind(this);
      this.handleNewSheet = this.handleNewSheet.bind(this);
      this.renderSheets = this.renderSheets.bind(this);
      this.handleFetchSheets = this.handleFetchSheets.bind(this);
      this.buildSheetList = this.buildSheetList.bind(this);
      this.renderSheetListError = this.renderSheetListError.bind(this);
   }

   async handleFetchSheets() {
      console.log('Menu.handleFetchSheets will need to send user id eventually');
      await this.props.fetchSheets();
   }

   async handleSave() {
      await this.props.saveAllUpdates(this.props.state);
      menuHidden();
   }

   handleNewSheet() {
      this.props.createdSheet({});
   }

   renderSheetListError() {
      const err = stateSheetsErrorMessage(this.props.state);
      if (isSomething(err)) {
         return <div>{err}</div>;
      }
   }

   displayChildren(textClasses, children) {
      const childrenList = R.map(childNode => {
         const grandChildrenList =
            isSomething(childNode.children) && arrayContainsSomething(childNode.children)
               ? this.displayChildren(textClasses, childNode.children)
               : null;
         return (
            <li className={textClasses} key={childNode.sheet.id}>
               {childNode.sheet.title}
               {grandChildrenList}
            </li>
         );
      })(children);
      return <ul>{childrenList}</ul>;
   }

   buildSheetList(textClasses) {
      const sheetsArr = stateSheets(this.props.state);
      if (isSomething(sheetsArr) && arrayContainsSomething(sheetsArr)) {
         const sheetsTree = buildSheetsTree(sheetsArr);
         const sheetList = R.map(node => (
            <li key={node.sheet.id} className={textClasses}>
               <div>{node.sheet.title}</div>
               {this.displayChildren(textClasses, node.children)}
            </li>
         ))(sheetsTree);
         return <ul>{sheetList}</ul>;
      }
      return null;
   }

   renderSheets(textClasses) {
      if (stateSheetsIsCallingDb(this.props.state)) {
         return <IconLoading height="1.5em" width="1.5em" />;
      }
      return (
         <div>
            {menuSheetsText(textClasses, this.handleFetchSheets)}
            {this.buildSheetList(textClasses)}
            {this.renderSheetListError()}
         </div>
      );
   }

   renderSave(textClasses) {
      if (stateIsStale(this.props.state)) {
         return (
            <div className={textClasses} onClick={this.handleSave}>
               {menuSaveText()}
            </div>
         );
      }
      if (stateIsCallingDb(this.props.state)) {
         return <IconLoading height="2em" width="2em" classes="p-2" />;
      }
      return <div className="p-2 text-grey-blue">{menuSaveText()}</div>;
   }

   renderHamburgerOrMenu() {
      if (stateShowMenu(this.props.state)) {
         const menuClasses = 'flex-col z-10 border-solid border-grey-blue border-2 w-1/2 absolute bg-white';
         const textClasses = 'p-2 text-subdued-blue hover:text-vibrant-blue cursor-pointer';
         return (
            <div className={menuClasses}>
               <div className="flex justify-between">
                  <div className={textClasses} onClick={this.handleNewSheet}>
                     {menuNewSheetText()}
                  </div>
                  <div className={textClasses} onClick={this.props.menuHidden}>
                     <IconClose height="1.5em" width="1.5em" />
                  </div>
               </div>
               {this.renderSave(textClasses)}
               {this.renderSheets(textClasses)}
            </div>
         );
      }
      return (
         <div onClick={this.props.menuShown}>
            <IconMenu height="1.5em" width="1.5em" />
         </div>
      );
   }

   render() {
      return this.renderHamburgerOrMenu();
   }
}

const mapStateToProps = (state, ownProps) => {
   return {
      state: state,
   };
};

export default connect(mapStateToProps, { saveAllUpdates, menuShown, menuHidden, createdSheet, fetchSheets })(Menu);
