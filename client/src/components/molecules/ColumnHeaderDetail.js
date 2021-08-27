import React, { useState } from 'react';
import * as R from 'ramda';
import managedStore from '../../store';
import { COLUMN_AXIS, DRAGGABLE_COLUMN_LETTER } from '../../constants';
import { COLUMN_GEAR_ICON_TEST_ID } from '../../__tests__/testHelpers/constants';
import { indexToColumnLetter, isSomething, getObjectFromArrayByKeyValue } from '../../helpers';
import { isFilterEngaged } from '../../helpers/visibilityHelpers';
import {
   stateColumnFilters,
   stateFrozenColumns,
   stateDragType,
   stateDragData,
} from '../../helpers/dataStructureHelpers';
import { columnMoved } from '../../actions/metadataActions';
import { startedUndoableAction, completedUndoableAction } from '../../actions/undoActions';
import { updatedAxisItemTool } from '../../actions/metadataActions';
import DraggableColumnLetter from '../atoms/DraggableColumnLetter';
import GearIcon from '../atoms/IconGear';
import ColumnHeaderTools from './ColumnHeaderTools';

const ColumnHeaderDetail = ({ index, frozen }) => {
   const [ isOver, setIsOver ]  = useState(false);

   const isDroppable = columnMovingIndex => 
      stateDragType(managedStore.state) === DRAGGABLE_COLUMN_LETTER && columnMovingIndex !== index;

   const handleDrop = event => {
      const { columnMovingIndex } = stateDragData(managedStore.state);
      if (isDroppable(columnMovingIndex)) {
         event.preventDefault();
         if (isSomething(columnMovingIndex)) {
            startedUndoableAction();
            columnMoved({ columnMoved: columnMovingIndex, columnMovedTo: index });
            setIsOver(false);
            completedUndoableAction('moved column ' + columnMovingIndex + ' to ' + index);
         }
      }
   }

   const handleDragOver = event => {
      const { columnMovingIndex } = stateDragData(managedStore.state);
      if (isDroppable(columnMovingIndex)) {
         event.preventDefault(); // doing this allows the drop
         event.dataTransfer.dropEffect = 'move'; // not sure how necessary this is
         setIsOver(true);
      }
   }

   const handleDragLeave = event =>  {
      if (stateDragType(managedStore.state) === DRAGGABLE_COLUMN_LETTER) {
         setIsOver(false);
      }
   }

   const showToolForColumn = event => {
      updatedAxisItemTool({
         axis: COLUMN_AXIS,
         index,
         isVisible: true,
      });
   }

   const freezeEngaged = () => R.pipe(
      stateFrozenColumns,
      getObjectFromArrayByKeyValue('index', index),
      R.prop('isFrozen'),
   )(managedStore.state)
 
   const gearClasses = 'p-1 self-center' + (
      isFilterEngaged(index, stateColumnFilters(managedStore.state)) || freezeEngaged()
         ? ' text-pale-purple hover:text-vibrant-purple'
         : ' text-grey-blue hover:text-vibrant-blue'
   );

   const render = () => {
      const columnLetter = indexToColumnLetter(index);
      const baseClasses = 'flex w-full h-full';
      const allClasses = isOver 
         ? baseClasses + ' bg-vibrant-blue' 
         : baseClasses + ' cursor-ew-move';

      return (
         <div className={allClasses} 
         onDragOver={handleDragOver}
         onDragLeave={handleDragLeave}
         onDrop={handleDrop}>
            <DraggableColumnLetter columnLetter={columnLetter} index={index} />
            <GearIcon
               classes={gearClasses}
               onClickFn={showToolForColumn}
               testId={COLUMN_GEAR_ICON_TEST_ID + index}
            />
            <ColumnHeaderTools index={index} frozen={frozen} />
         </div>
      );
   }
   return render();
}

export default ColumnHeaderDetail;
