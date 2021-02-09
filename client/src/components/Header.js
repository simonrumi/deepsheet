import React, { Component } from 'react';
import { connect } from 'react-redux';
import { stateTitleText, stateTitleIsEditingTitle } from '../helpers/dataStructureHelpers';
import SheetHeader from './molecules/SheetHeader';
import TitleForm from './molecules/TitleForm';
import Menu from './organisms/Menu';

export class Header extends Component {
   renderTitleOrTitleForm() {
      if (this.props.isEditingTitle) {
         return <TitleForm />;
      }
      return <SheetHeader />;
   }

   render() {
      return (
         <div id="header" className="fixed flex border-b border-grey-blue w-full bg-white shadow-md">
            <div className="pr-2 max-w-4">
               <Menu />
            </div>
            <div className="w-full">{this.renderTitleOrTitleForm()}</div>
         </div>
      );
   }
}

function mapStateToProps(state) {
   return {
      isEditingTitle: stateTitleIsEditingTitle(state),
      titleText: stateTitleText(state),
   };
}

export default connect(mapStateToProps)(Header);
