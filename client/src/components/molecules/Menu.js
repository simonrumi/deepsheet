import React, { Component } from 'react';
import { connect } from 'react-redux';
import IconMenu from '../atoms/IconMenu';
import IconClose from '../atoms/IconClose';
import IconLoading from '../atoms/IconLoading';
import { menuShown, menuHidden } from '../../actions/menuActions';
import { createdSheet } from '../../actions/sheetActions';
import { stateIsStale, stateIsCallingDb, stateShowMenu } from '../../helpers/dataStructureHelpers';
import { saveAllUpdates } from '../../services/sheetServices';

class Menu extends Component {
   constructor(props) {
      super(props);
      this.handleSave = this.handleSave.bind(this);
      this.handleNewSheet = this.handleNewSheet.bind(this);
   }

   async handleSave() {
      await this.props.saveAllUpdates(this.props.state);
      menuHidden();
   }

   handleNewSheet() {
      this.props.createdSheet({});
   }

   renderSave(textClasses) {
      if (stateIsStale(this.props.state)) {
         return (
            <div className={textClasses} onClick={this.handleSave}>
               Save
            </div>
         );
      }
      if (stateIsCallingDb(this.props.state)) {
         return <IconLoading height="2em" width="2em" classes="p-2" />;
      }
      return <div className="p-2 text-grey-blue">Save</div>;
   }

   renderHamburgerOrMenu() {
      if (stateShowMenu(this.props.state)) {
         const menuClasses = 'flex-col z-10 border-solid border-grey-blue border-2 w-1/4 absolute bg-white';
         const textClasses = 'p-2 text-subdued-blue hover:text-vibrant-blue cursor-pointer';
         return (
            <div className={menuClasses}>
               <div className="flex justify-between">
                  <div className={textClasses} onClick={this.handleNewSheet}>
                     New Sheet...
                  </div>
                  <div className={textClasses} onClick={this.props.menuHidden}>
                     <IconClose height="1.5em" width="1.5em" />
                  </div>
               </div>
               {this.renderSave(textClasses)}
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

export default connect(mapStateToProps, { saveAllUpdates, menuShown, menuHidden, createdSheet })(Menu);
