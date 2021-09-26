import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
   stateParentSheetId,
   stateIsStale,
   stateIsCallingDb,
   stateTitleText,
   statePast,
   stateFuture,
   stateTitleIsEditingTitle,
   stateClipboardRangeCells,
} from '../helpers/dataStructureHelpers';
import SheetHeader from './molecules/SheetHeader';
import TitleForm from './molecules/TitleForm';
import Menu from './organisms/Menu';

const Header = () => {
   const isEditingTitle = useSelector(state => stateTitleIsEditingTitle(state));
   const title = useSelector(state => stateTitleText(state));
   const past = useSelector(state => statePast(state));
   const future = useSelector(state => stateFuture(state));
   const isStale = useSelector(state => stateIsStale(state));
   const isCallingDb = useSelector(state => stateIsCallingDb(state));
   const parentSheetId = useSelector(state => stateParentSheetId(state));
   const clipboardRangeCells = useSelector(state => stateClipboardRangeCells(state));

   const memoizedSheetHeader = useMemo(() => {
      return isEditingTitle 
         ? <TitleForm /> 
         : <SheetHeader 
            title={title} 
            past={past} 
            future={future} 
            isStale={isStale} 
            isCallingDb={isCallingDb} 
            parentSheetId={parentSheetId}
            clipboardRangeCells={clipboardRangeCells}
         />
   }, [isEditingTitle, title, past, future, isStale, isCallingDb, parentSheetId, clipboardRangeCells ])

   return (
      <div id="header" className="fixed flex border-b border-grey-blue w-full bg-white shadow-md">
         <div className="pr-2 max-w-4">
            <Menu />
         </div>
         <div className="w-full">{memoizedSheetHeader}</div>
      </div>
   );
}

export default Header;