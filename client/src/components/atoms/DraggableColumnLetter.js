import React, { useRef, useState } from 'react';
import { startedDrag, endedDrag } from '../../actions/dragActions';
import { DRAGGABLE_COLUMN_LETTER } from '../../actions/dragTypes';

const DragableColumnLetter = props => {
   const { columnLetter, index } = props;
   const [ isDragging, setIsDragging ]  = useState(false); // we have isDragging in the redux store also, but it's convenient to have it here so that we don't have to figure out if it is this particular component that is being dragged
   const columnNumberRef = useRef(null);

   const handleDragStart = event => {
      event.dataTransfer.effectAllowed = 'move'; // unclear as to whether this is necessary. MDN says to use it but doesn't seem to be in the example here: https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/dropEffect
      event.dataTransfer.setDragImage(columnNumberRef.current, 0, 0); 
      setIsDragging(true); 
      startedDrag({ dragType: DRAGGABLE_COLUMN_LETTER, dragData: { columnMovingIndex: index } });
   }

   const handleDragEnd = event => {
      setIsDragging(false);
      endedDrag();
   }

   const baseClasses = 'w-full text-center self-center'; //w-3/4
   const allClasses = isDragging
      ? baseClasses + ' text-vibrant-blue'
      : baseClasses + ' text-grey-blue';
   
   return (
      <div
         className={allClasses}
         draggable="true"
         onDragStart={handleDragStart}
         onDragEnd={handleDragEnd}>
            <span ref={columnNumberRef}>{columnLetter}</span>
      </div>
   ); // note that the inner span tag is so that the draggable image will only be the letter itself, not the whole width of the div
}

export default DragableColumnLetter;
