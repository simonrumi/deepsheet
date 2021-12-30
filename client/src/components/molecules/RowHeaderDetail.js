import React, { useState } from 'react';
import * as R from 'ramda';
import managedStore from  '../../store';
import { ROW_AXIS } from '../../constants';
import { ROW_GEAR_ICON_TEST_ID } from '../../__tests__/testHelpers/constants';
import { indexToRowNumber, isSomething, getObjectFromArrayByKeyValue } from '../../helpers';
import {
   cellRow,
   stateFrozenRows,
   stateRowFilters,
   stateDragType,
   stateDragData,
} from '../../helpers/dataStructureHelpers';
import { isFilterEngaged } from '../../helpers/visibilityHelpers';
import { rowMoved } from '../../actions/metadataActions';
import { updatedAxisItemTool } from '../../actions/metadataActions';
import { ROW_MOVED } from '../../actions/metadataTypes';
import { startedUndoableAction, completedUndoableAction } from '../../actions/undoActions';
import { DRAGGABLE_ROW_NUMBER } from '../../actions/dragTypes';
import { createRowDropMessage } from '../displayText';
import RowHeaderTools from './RowHeaderTools';
import GearIcon from '../atoms/IconGear';
import DraggableRowNumber from '../atoms/DraggableRowNumber';

const RowHeaderDetail = ({ cell, frozen }) => {
   const index = cellRow(cell);
   const [ isOver, setIsOver ]  = useState(false);

   const isDroppable = rowMovingIndex => 
      stateDragType(managedStore.state) === DRAGGABLE_ROW_NUMBER && rowMovingIndex !== index;

   const handleDrop = event => {
      const { rowMovingIndex } = stateDragData(managedStore.state);
      if (isDroppable(rowMovingIndex)) {
         event.preventDefault();
         if (isSomething(rowMovingIndex)) {
            startedUndoableAction({ undoableType: ROW_MOVED, timestamp: Date.now() });
            rowMoved({ rowMoved: rowMovingIndex, rowMovedTo: index });
            setIsOver(false);
            completedUndoableAction({
					undoableType: ROW_MOVED,
               message: createRowDropMessage({ rowMovingIndex, toIndex: index }),
               timestamp: Date.now()
				});
         }
      }
   }

   const handleDragOver = event => {
      const { rowMovingIndex } = stateDragData(managedStore.state);
      if (isDroppable(rowMovingIndex)) {
         event.preventDefault(); // doing this allows the drop
         event.dataTransfer.dropEffect = 'move'; // not sure how necessary this is
         setIsOver(true);
      }
   }

   const handleDragLeave = event =>  {
      if (stateDragType(managedStore.state) === DRAGGABLE_ROW_NUMBER) {
         setIsOver(false);
      }
   }

   // this pops up the RowHeaderTools (onCLick), then there is hideToolForRow within the RowHeaderTools (onMouseLeave)
   const showToolForRow = event => {
      updatedAxisItemTool({
         axis: ROW_AXIS,
         index,
         isVisible: true,
      });
   }

   const freezeEngaged = () => R.pipe(
      stateFrozenRows,
      getObjectFromArrayByKeyValue('index', index),
      R.prop('isFrozen'),
   )(managedStore.state)

   const gearClasses = 'self-center pl-1 pr-1' + (
      isFilterEngaged(index, stateRowFilters(managedStore.state)) || freezeEngaged()
         ? ' text-pale-purple hover:text-vibrant-purple'
         : ' text-grey-blue hover:text-vibrant-blue'
   );

   const render = () => {
      const rowNum = indexToRowNumber(index);
      const baseClasses = 'flex w-full h-full justify-between';
      const allClasses = isOver
         ? baseClasses + ' bg-vibrant-blue'
         : baseClasses + ' cursor-ns-move';

      return (
         <div className={allClasses} 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}>
               <DraggableRowNumber number={rowNum} index={index} />
               <GearIcon
                  classes={gearClasses}
                  onClickFn={showToolForRow}
                  testId={ROW_GEAR_ICON_TEST_ID + index}
               />
               <RowHeaderTools index={index} frozen={frozen} />
         </div>
      );
   }
   return render();
}

export default RowHeaderDetail;