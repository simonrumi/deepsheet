import React from 'react';
import { useSelector } from 'react-redux';
import IconLoading from '../atoms/IconLoading';
import { menuSheetsText } from '../displayText';
import { fetchSheets } from '../../services/sheetServices';
import { isSomething } from '../../helpers';
import { buildSheetList } from '../../helpers/sheetsHelpers';
import {
   stateSheets,
   stateSheetsTree,
   stateSheetsIsCallingDb,
   stateSheetsErrorMessage,
   stateSheetId,
   stateSheetsTreeStale,
} from '../../helpers/dataStructureHelpers';
import RefreshIcon from '../atoms/IconRefresh';

const SheetsDisplay = props => {
   const sheetsArr = useSelector(state => stateSheets(state));
   const sheetsTree = useSelector(state => stateSheetsTree(state));
   const sheetsIsCallingDb = useSelector(state => stateSheetsIsCallingDb(state));
   const sheetsErrorMessage = useSelector(state => stateSheetsErrorMessage(state));
   const sheetId = useSelector(state => stateSheetId(state));
   const sheetsTreeIsStale = useSelector(state => stateSheetsTreeStale(state));

   const errorClasses = 'px-2 text-burnt-orange';

   const renderSheetListError = () =>
      isSomething(sheetsErrorMessage) ? <div className={errorClasses}>{sheetsErrorMessage.message}</div> : null;

   const handleFetchSheets = async () => {
      await fetchSheets();
   }

   const renderSheetsHeading = () => (
      <div className="flex justify-between w-full items-center">
         {menuSheetsText()}
         <RefreshIcon height="1.2em" width="1.2em" classes="pr-2" onClickFn={handleFetchSheets} />
      </div>
   );

   const renderSheets = () => {
      if (sheetsIsCallingDb) {
         return <IconLoading height="1.5em" width="1.5em" />;
      }
      return (
         <div className="border-t border-grey-blue w-full">
            {renderSheetsHeading()}
            {buildSheetList({ sheetId, sheetsArr, sheetsTree, sheetsTreeIsStale })}
            {renderSheetListError()}
         </div>
      );
   }

   return renderSheets();
}

export default SheetsDisplay;