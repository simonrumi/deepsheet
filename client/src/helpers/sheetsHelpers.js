import * as R from 'ramda';
import React from 'react';
import managedStore from '../store';
import { isNothing, isSomething, arrayContainsSomething, getObjectFromArrayByKeyValue } from './index';
import { getUserInfoFromCookie } from './userHelpers';
import { clearCells } from './cellHelpers';
import {
   sheetParentSheetId,
   stateParentSheetId,
   stateSheetId,
   stateSheets,
   cellSubsheetIdSetter,
   cellSubsheetId,
   dbCells,
} from './dataStructureHelpers';
import { menuDeleteSheetError } from '../components/displayText';
import { fetchSheet, loadSheet, deleteSheets } from '../services/sheetServices';
import {
   updatedSheetsTreeNode,
   updatedSheetsTree,
   sheetsTreeStale,
   sheetsTreeCurrent,
} from '../actions/sheetsActions';
import { triggeredFetchSheet } from '../actions/sheetActions';
import { updatedParentSheetId } from '../actions/metadataActions';
import { clearedAllCellKeys } from '../actions/cellActions';
import { updateCellsMutation } from '../queries/cellMutations';
import IconRightArrow from '../components/atoms/IconRightArrow';
import IconDelete from '../components/atoms/IconDelete';

/* Here's what a node in the tree of sheets looks like
   node = { 
      sheet: {
         id,
         title,
         metadata: {
            parentSheetId
         }
      },
      children: [node1, node2, etc],
      error: 'some error here'
   } 
*/

const createNode = sheet => ({ sheet, children: [], error: null });

const addChildNode = (parent, child) => ({ ...parent, children: R.append(child, parent.children) });

const removeChildNode = (parent, childToRemove) => {
   if (arrayContainsSomething(parent.children)) {
      const newChildren = R.filter(child => !(child.sheet.id === childToRemove.sheet.id), parent.children);
      return { ...parent, children: newChildren };
   }
   return parent;
};

const maybePlaceSheetInTree = (parentNode, newSheet) => {
   // try to add the newSheet as a direct child of the parentNode...
   if (parentNode.sheet.id === sheetParentSheetId(newSheet)) {
      return addChildNode(parentNode, createNode(newSheet));
   }
   let childPositionFound = false; // this is a bit icky...we will mutate this variable, but it is for use only inside this function
   const updatedParent = R.reduce(
      (accumulator, childNode) => {
         // try to add the newSheet as a child of one of the parentNode's children...
         if (childNode.sheet.id === sheetParentSheetId(newSheet)) {
            const newChildNode = addChildNode(childNode, createNode(newSheet)); // adds a grandchild to the child node
            const newParentNode = removeChildNode(accumulator, newChildNode);
            childPositionFound = true;
            return R.reduced(addChildNode(newParentNode, newChildNode));
         }
         // ...failing that, a depth-first, recursive attempt to place newSheet with one of the children of the parentNode
         const maybeChildNodeWithNewSheet = maybePlaceSheetInTree(childNode, newSheet);
         if (maybeChildNodeWithNewSheet) {
            const newParentNode = removeChildNode(accumulator, maybeChildNodeWithNewSheet);
            childPositionFound = true;
            return R.reduced(addChildNode(newParentNode, maybeChildNodeWithNewSheet));
         }
         // if that fails, then the childPositionFound remains false, and the accumulator returns the unchanged parentNode
         return accumulator;
      },
      parentNode,
      parentNode.children
   );
   if (childPositionFound) {
      return updatedParent;
   }
   return childPositionFound; // will be false
};

const replaceNodeInArr = (newNode, nodeArr) =>
   R.map(node => (newNode.sheet.id === node.sheet.id ? newNode : node))(nodeArr);

const isParentSheet = R.curry((sheetsArr, parentSheetId) => {
   if (isNothing(parentSheetId)) {
      return true;
   }
   const sheetInArr = getObjectFromArrayByKeyValue('id', parentSheetId, sheetsArr);
   return isNothing(sheetInArr);
});

export const createSheetsTreeFromArray = sheetsArr => {
  const parentSheets = R.filter(
      sheet => R.pipe(
         sheetParentSheetId,
         isParentSheet(sheetsArr)
      )(sheet)
   )(sheetsArr);
   const parentNodes = R.map(sheet => createNode(sheet))(parentSheets);
   const unassignedSheets = R.filter(
      sheet => R.pipe(
         sheetParentSheetId, 
         isParentSheet(sheetsArr),
         R.not
      )(sheet)
   )(sheetsArr);
   return R.reduce(
      (accumulatorArr, unassignedSheet) => {
         const updatedParentNodesArr = R.reduce(
            (parentNodesArr, parentNode) => {
               const newParentNode = maybePlaceSheetInTree(parentNode, unassignedSheet);
               return newParentNode ? R.reduced(replaceNodeInArr(newParentNode, parentNodesArr)) : parentNodesArr;
            },
            accumulatorArr, // initial accumulator value is all the parentNodes, as is
            accumulatorArr
         );
         return updatedParentNodesArr;
      },
      parentNodes, // initial accumulator value is all the parentNodes, as is
      unassignedSheets
   );
};

export const getSheetIdsFromNode = (node, sheetIds = []) => {
   const updatedSheetIds = R.append(node.sheet.id, sheetIds);
   return isNothing(node.children) || !arrayContainsSomething(node.children)
      ? updatedSheetIds
      : R.pipe(
           R.reduce((accumulatorArr, childNode) => getSheetIdsFromNode(childNode, accumulatorArr), []),
           R.concat(updatedSheetIds)
        )(node.children);
};

const getCellsFromSheet = async sheetId => {
   if (isNothing(sheetId)) {
      console.error('sheetsHelpers.js getCellsFromSheet was not given a sheetId');
      return null;
   }
   const sheet = await fetchSheet(sheetId);
   return isSomething(sheet) ? dbCells(sheet) : [];
};

export const removeSheetFromParent = async (node, userId) => {
   const sheetId = node.sheet.id;
   const parentId = sheetParentSheetId(node.sheet);
   if (isNothing(sheetId) || isNothing(parentId)) {
      return null;
   }
   const parentCells = await getCellsFromSheet(parentId);

   await R.reduce(
      async (accumulator, parentCell) => {
         if (cellSubsheetId(parentCell) === sheetId) {
            const newCell = cellSubsheetIdSetter(null, parentCell);
            await updateCellsMutation({ sheetId: parentId, cells: [newCell], userId });
            return R.reduced(true);
         }
         return accumulator;
      },
      false,
      parentCells
   );
};

export const replaceNodeWithinSheetsTree = (updatedNode, sheetsTree) => {
   // note that the sheetsTree is actually an array, with each element containing a top level node
   const sheetId = updatedNode.sheet.id;
   const returnVal = R.map(
      node => {
         if (R.equals(node.sheet.id, sheetId)) {
            return updatedNode;
         }
         if (arrayContainsSomething(node.children)) {
            return { 
               ...node, 
               children: replaceNodeWithinSheetsTree(updatedNode, node.children) 
            };
         }
         return node;
      }
   )(sheetsTree);
   return returnVal;
}

const handleSheetDelete = async (node, sheetId) => {
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

const getIconDeleteClasses = node => isSomething(node.error) ? "text-burnt-orange hover:text-vibrant-burnt-orange pr-2" : "pr-2";
const errorClasses = 'px-2 text-burnt-orange';

const displayChildren = (basicClasses, hoverClasses, children, sheetId) => {
   const childrenList = R.map(childNode => {
      const grandChildrenList =
         arrayContainsSomething(childNode.children)
            ? displayChildren(basicClasses, hoverClasses, childNode.children, sheetId)
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
                  onClickFn={() => handleSheetDelete(childNode, sheetId)}
               />
            </div>
            <div className={errorClasses}>{childNode.error}</div>
            {grandChildrenList}
         </li>
      );
   })(children);
   return <ul>{childrenList}</ul>;
}

export const buildSheetList = ({ sheetId, sheetsArr, sheetsTree, sheetsTreeIsStale }) => {
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
            {displayChildren(basicClasses, hoverClasses, node.children, sheetId)}
         </li>
      ))(sheetsTree);
      return <ul>{sheetList}</ul>;
   }
   return null;
}

export const validateParentSheetId = () => {
   const parentSheetId = stateParentSheetId(managedStore.state);
   if (isSomething(parentSheetId)) {
      const parentSheetIdInSheetsList = R.pipe(
         getObjectFromArrayByKeyValue,
         isSomething,
      )('id', parentSheetId, stateSheets(managedStore.state));
      if (!parentSheetIdInSheetsList) {
         updatedParentSheetId(null);
      }
   }
}