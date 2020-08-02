import * as R from 'ramda';
import { isSomething, isNothing, arrayContainsSomething } from './index';
import { stateParentSheetId } from './dataStructureHelpers';

/* Here's what a node in the tree looks like
   node = { 
   sheet: {
      id,
      title,
      metadata: {
         parentSheetId
      }
   },
   children: [node1, node2, etc],
} */

const createNode = sheet => ({ sheet, children: [] });

const addChildNode = (parent, child) => ({ ...parent, children: R.append(child, parent.children) });

const removeChildNode = (parent, childToRemove) => {
   if (isSomething(parent.children) && arrayContainsSomething(parent.children)) {
      const newChildren = R.filter(child => !(child.sheet.id === childToRemove.sheet.id), parent.children);
      return { ...parent, children: newChildren };
   }
   return parent;
};

const maybePlaceSheetInTree = (parentNode, newSheet) => {
   // try to add the newSheet as a direct child of the parentNode...
   if (parentNode.sheet.id === stateParentSheetId(newSheet)) {
      return addChildNode(parentNode, createNode(newSheet));
   }
   let childPositionFound = false; // this is a bit icky...we will mutate this variable, but it is for use only inside this function
   const updatedParent = R.reduce(
      (accumulator, childNode) => {
         // try to add the newSheet as a child of one of the parentNode's children...
         if (childNode.sheet.id === stateParentSheetId(newSheet)) {
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

export const buildSheetsTree = sheetsArr => {
   const parentSheets = R.filter(sheet => R.pipe(stateParentSheetId, isNothing)(sheet))(sheetsArr);
   const parentNodes = R.map(sheet => createNode(sheet))(parentSheets);
   const unassignedSheets = R.filter(sheet => R.pipe(stateParentSheetId, isSomething)(sheet))(sheetsArr);

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
