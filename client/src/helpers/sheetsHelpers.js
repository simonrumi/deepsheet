import * as R from 'ramda';
import { isNothing, isSomething, arrayContainsSomething, getObjectFromArrayByKeyValue } from './index';
import { sheetParentSheetId, cellSubsheetIdSetter, cellSubsheetId, dbCells } from './dataStructureHelpers';
import { fetchSheet } from '../services/sheetServices';
import { updateCellsMutation } from '../queries/cellMutations';

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
