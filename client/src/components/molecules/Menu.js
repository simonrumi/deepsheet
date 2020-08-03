import React, { Component } from 'react';
import * as R from 'ramda';
import { connect } from 'react-redux';
import IconMenu from '../atoms/IconMenu';
import IconClose from '../atoms/IconClose';
import IconLoading from '../atoms/IconLoading';
import IconRightArrow from '../atoms/IconRightArrow';
import IconDelete from '../atoms/IconDelete';
import { menuSaveText, menuNewSheetText, menuSheetsText } from '../displayText';
import { menuShown, menuHidden } from '../../actions/menuActions';
import { createdSheet } from '../../actions/sheetActions';
import { loadSheet, saveAllUpdates, fetchSheets, deleteSheets } from '../../services/sheetServices';
import { isSomething, arrayContainsSomething } from '../../helpers';
import { buildSheetsTree, getSheetIdsFromNode } from '../../helpers/sheetsHelpers';
import {
   stateIsStale,
   stateIsCallingDb,
   stateShowMenu,
   stateSheets,
   stateSheetsIsCallingDb,
   stateSheetsErrorMessage,
} from '../../helpers/dataStructureHelpers';

class Menu extends Component {
   constructor(props) {
      super(props);
      this.handleSave = this.handleSave.bind(this);
      this.handleNewSheet = this.handleNewSheet.bind(this);
      this.renderSheets = this.renderSheets.bind(this);
      this.handleFetchSheets = this.handleFetchSheets.bind(this);
      this.buildSheetList = this.buildSheetList.bind(this);
      this.renderSheetListError = this.renderSheetListError.bind(this);
      this.handleSheetDelete = this.handleSheetDelete.bind(this);
   }

   handleSheetDelete(node) {
      const sheetIds = getSheetIdsFromNode(node);
      deleteSheets(sheetIds);
   }

   displayChildren(basicClasses, hoverClasses, children) {
      const childrenList = R.map(childNode => {
         const grandChildrenList =
            isSomething(childNode.children) && arrayContainsSomething(childNode.children)
               ? this.displayChildren(basicClasses, hoverClasses, childNode.children)
               : null;
         return (
            <li className={basicClasses} key={childNode.sheet.id}>
               <div className="flex items-center justify-between">
                  <div className="flex items-center">
                     <IconRightArrow height="0.75em" width="0.75em" classes="pr-2 text-subdued-blue" />
                     <span className={hoverClasses} onClick={() => loadSheet(this.props.state, childNode.sheet.id)}>
                        {childNode.sheet.title}
                     </span>
                  </div>
                  <IconDelete
                     height="1.0em"
                     width="1.0em"
                     classes="pr-2"
                     onClickFn={() => this.handleSheetDelete(childNode)}
                  />
               </div>
               {grandChildrenList}
            </li>
         );
      })(children);
      return <ul>{childrenList}</ul>;
   }

   renderSheetListError() {
      const err = stateSheetsErrorMessage(this.props.state);
      if (isSomething(err)) {
         return <div>{err}</div>;
      }
   }

   buildSheetList(textClasses) {
      const basicClasses = 'pl-2 pt-2 text-subdued-blue';
      const hoverClasses = 'hover:text-vibrant-blue cursor-pointer';
      const sheetsArr = stateSheets(this.props.state);
      if (isSomething(sheetsArr) && arrayContainsSomething(sheetsArr)) {
         const sheetsTree = buildSheetsTree(sheetsArr);
         const sheetList = R.map(node => (
            <li key={node.sheet.id} className={'ml-2 ' + basicClasses}>
               <div className="flex align-center justify-between">
                  <span className={hoverClasses} onClick={() => loadSheet(this.props.state, node.sheet.id)}>
                     {node.sheet.title}
                  </span>
                  <IconDelete
                     height="1.0em"
                     width="1.0em"
                     classes="pr-2"
                     onClickFn={() => this.handleSheetDelete(node)}
                  />
               </div>
               {this.displayChildren(basicClasses, hoverClasses, node.children)}
            </li>
         ))(sheetsTree);
         return <ul>{sheetList}</ul>;
      }
      return null;
   }

   async handleFetchSheets() {
      console.log('Menu.handleFetchSheets will need to send user id eventually');
      await this.props.fetchSheets();
   }

   async handleSave() {
      await this.props.saveAllUpdates(this.props.state);
      menuHidden();
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

   handleNewSheet() {
      this.props.createdSheet({});
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
