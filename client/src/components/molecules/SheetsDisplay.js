import * as R from 'ramda';
import React from 'react';
import managedStore from '../../store';
import { useSelector } from 'react-redux';
import IconLoading from '../atoms/IconLoading';
import IconRightArrow from '../atoms/IconRightArrow';
import IconDelete from '../atoms/IconDelete';
import { menuSheetsText, menuDeleteSheetError } from '../displayText';
import { loadSheet, deleteSheets, fetchSheets } from '../../services/sheetServices';
import {
   updatedSheetsTreeNode,
   updatedSheetsTree,
   sheetsTreeStale,
   sheetsTreeCurrent,
} from '../../actions/sheetsActions';
import { triggeredFetchSheet } from '../../actions/sheetActions';
import { clearedAllCellKeys } from '../../actions/cellActions';
import { isSomething, arrayContainsSomething } from '../../helpers';
import { createSheetsTreeFromArray, getSheetIdsFromNode, removeSheetFromParent } from '../../helpers/sheetsHelpers';
import { getUserInfoFromCookie } from '../../helpers/userHelpers';
import { clearCells } from '../../helpers/cellHelpers';
import {
   stateSheets,
   stateSheetsTree,
   stateSheetsIsCallingDb,
   stateSheetsErrorMessage,
   stateSheetId,
   stateParentSheetId,
   stateSheetsTreeStale,
} from '../../helpers/dataStructureHelpers';

const SheetsDisplay = props => {
   const sheetsArr = useSelector(state => stateSheets(state));
   const sheetsTree = useSelector(state => stateSheetsTree(state));
   const sheetsIsCallingDb = useSelector(state => stateSheetsIsCallingDb(state));
   const sheetsErrorMessage = useSelector(state => stateSheetsErrorMessage(state));
   const sheetId = useSelector(state => stateSheetId(state));
   const sheetsTreeIsStale = useSelector(state => stateSheetsTreeStale(state));

   const errorClasses = 'px-2 text-burnt-orange';

   const handleSheetDelete = async node => {
      try {
         const { userId } = getUserInfoFromCookie();
         await removeSheetFromParent(node, userId);
         const sheetIds = getSheetIdsFromNode(node);
         await deleteSheets(sheetIds, userId);
         
         if (stateSheetId(managedStore.state) === node.sheet.id) {
            clearCells(managedStore.state);
            clearedAllCellKeys();
            await triggeredFetchSheet();
         }
         
         sheetsTreeStale();

         if (stateParentSheetId(node.sheet) === sheetId) {
            console.warn('SheetsDisplay.handleSheetDelete has the case where the parentSheetId === sheetId, so now it will call loadSheet for the sheetId');
            await loadSheet(managedStore.state, sheetId);
         }
      } catch (err) {
         console.warn('could not delete sheet');
         updatedSheetsTreeNode({ ...node, error: menuDeleteSheetError() });
      }
   }

   const getIconDeleteClasses = node => {
      return isSomething(node.error) ? "text-burnt-orange hover:text-vibrant-burnt-orange pr-2" : "pr-2";
   }

   const displayChildren = (basicClasses, hoverClasses, children) => {
      const childrenList = R.map(childNode => {
         const grandChildrenList =
            arrayContainsSomething(childNode.children)
               ? displayChildren(basicClasses, hoverClasses, childNode.children)
               : null;
         return (
            <li className={basicClasses} key={childNode.sheet.id}>
               <div className="flex items-center justify-between">
                  <div className="flex items-center">
                     <IconRightArrow height="0.75em" width="0.75em" classes="pr-2 text-subdued-blue" />
                     <span className={hoverClasses} onClick={() => loadSheet(managedStore.state, childNode.sheet.id)}>
                        {childNode.sheet.title}
                     </span>
                  </div>
                  <IconDelete
                     height="1.0em"
                     width="1.0em"
                     classes={getIconDeleteClasses(childNode)}
                     onClickFn={() => handleSheetDelete(childNode)}
                  />
               </div>
               <div className={errorClasses}>{childNode.error}</div>
               {grandChildrenList}
            </li>
         );
      })(children);
      return <ul>{childrenList}</ul>;
   }

   const renderSheetListError = () =>
      isSomething(sheetsErrorMessage) ? <div className={errorClasses}>{sheetsErrorMessage.message}</div> : null;

   const buildSheetList = () => {
      const basicClasses = 'pl-2 pt-2 text-subdued-blue';
      const hoverClasses = 'hover:text-vibrant-blue cursor-pointer';
      if (arrayContainsSomething(sheetsArr) && (!arrayContainsSomething(sheetsTree) || sheetsTreeIsStale)) {
         const newSheetsTree = createSheetsTreeFromArray(sheetsArr);
         setTimeout(() => {
            updatedSheetsTree(newSheetsTree);
            sheetsTreeCurrent();
         }, 0); // run updatedSheetsTree 1 tick later so we can finish rendering SheetsDisplay first (otherwise we get a console warning)
      }
      if (arrayContainsSomething(sheetsTree)) {
         const sheetList = R.map(node => (
            <li key={node.sheet.id} className={'ml-2 ' + basicClasses}>
               <div className="flex align-center justify-between">
                  <span className={hoverClasses} onClick={() => loadSheet(managedStore.state, node.sheet.id)}>
                     {node.sheet.title}
                  </span>
                  <div className={errorClasses}>{node.error}</div>
                  <IconDelete
                     height="1.0em"
                     width="1.0em"
                     classes={getIconDeleteClasses(node)}
                     onClickFn={() => handleSheetDelete(node)}
                  />
               </div>
               {displayChildren(basicClasses, hoverClasses, node.children)}
            </li>
         ))(sheetsTree);
         return <ul>{sheetList}</ul>;
      }
      return null;
   }

   const handleFetchSheets = async () => {
      await fetchSheets();
   }

   const renderSheets = () => {
      const textClasses = 'p-2 text-subdued-blue hover:text-vibrant-blue cursor-pointer';
      if (sheetsIsCallingDb) {
         return <IconLoading height="1.5em" width="1.5em" />;
      }
      return (
         <div>
            {menuSheetsText(textClasses, handleFetchSheets)}
            {buildSheetList()}
            {renderSheetListError()}
         </div>
      );
   }

   return renderSheets();
}

export default SheetsDisplay;