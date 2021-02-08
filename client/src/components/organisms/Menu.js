import React from 'react';
import { useSelector } from 'react-redux';
import * as R from 'ramda';
import managedStore from '../../store';
import IconMenu from '../atoms/IconMenu';
import IconClose from '../atoms/IconClose';
import IconLoading from '../atoms/IconLoading';
import SheetsDisplay from '../molecules/SheetsDisplay';
import { menuSaveText, menuNewSheetText } from '../displayText';
import { menuShown, menuHidden } from '../../actions/menuActions';
import { createdSheet } from '../../actions/sheetActions';
import { saveAllUpdates } from '../../services/sheetServices';
import { getUserInfoFromCookie } from '../../helpers/userHelpers';
import {
   stateIsStale,
   stateIsCallingDb,
   stateShowMenu,
} from '../../helpers/dataStructureHelpers';

const Menu = props => {
   const isStale = useSelector(state => stateIsStale(state));
   const isCallingDb = useSelector(state => stateIsCallingDb(state));
   const showMenu = useSelector(state => stateShowMenu(state));

   const handleSave = async () => {
      await saveAllUpdates(managedStore.state);
      menuHidden();
   }

   const renderSave = textClasses => {
      if (isStale) {
         return (
            <div className={textClasses} onClick={handleSave}>
               {menuSaveText()}
            </div>
         );
      }
      if (isCallingDb) {
         return <IconLoading height="2em" width="2em" classes="p-2" />;
      }
      return <div className="p-2 text-grey-blue">{menuSaveText()}</div>;
   }

   const handleNewSheet = R.pipe(getUserInfoFromCookie, createdSheet);

   const renderHamburgerOrMenu = () => {
      if (showMenu) {
         const menuClasses = 'absolute flex-col z-30 border-solid border-grey-blue border-2 w-1/4 overflow-y-auto bg-white shadow-lg';
         const menuStyle = { maxHeight: '95vh' }; // a little less than the full size of the window to allow for the scrollbar at the bottom. TODO make this a class in tailwind
         const textClasses = 'p-2 text-subdued-blue hover:text-vibrant-blue cursor-pointer';
         return (
            <div className={menuClasses} style={menuStyle} >
               <div className="flex justify-between">
                  <div className={textClasses} onClick={handleNewSheet}>
                     {menuNewSheetText()}
                  </div>
                  <div className={textClasses} onClick={menuHidden}>
                     <IconClose height="1.5em" width="1.5em" />
                  </div>
               </div>
               {renderSave(textClasses)}
               <SheetsDisplay />
            </div>
         );
      }
      return (
         <div onClick={menuShown}>
            <IconMenu height="1.5em" width="1.5em" />
         </div>
      );
   }

   return renderHamburgerOrMenu();
}

export default Menu;
