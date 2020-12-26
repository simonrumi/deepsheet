import React, { useRef, useState } from 'react';
import { startedDrag, endedDrag } from '../../actions/dragActions';
import { DRAGGABLE_ROW_NUMBER } from '../../constants';

const DraggableRowNumber = props => {
   const { number, index } = props;
   const [ isDragging, setIsDragging ]  = useState(false); // we have isDragging in the redux store also, but it's convenient to have it here so that we don't have to figure out if it is this particular component that is being dragged
   const rowNumberRef = useRef(null);

   const handleDragStart = event => {
      event.dataTransfer.effectAllowed = 'move'; // unclear as to whether this is necessary. MDN says to use it but doesn't seem to be in the example here: https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/dropEffect
      event.dataTransfer.setDragImage(rowNumberRef.current, 0, 0); 
      setIsDragging(true); 
      startedDrag({ dragType: DRAGGABLE_ROW_NUMBER, dragData: { rowMovingIndex: index } });
   }

   const handleDragEnd = event => {
      setIsDragging(false);
      endedDrag();
   }

   // w-2/4 
   const baseClasses = 'p-1 text-center self-center cursor-ns-move'; 
   const allClasses = isDragging
      ? baseClasses + ' text-vibrant-blue'
      : baseClasses + ' text-grey-blue';

   return (
      <div
         className={allClasses}
         draggable="true"
         onDragStart={handleDragStart}
         onDragEnd={handleDragEnd}>
            <span ref={rowNumberRef}>{number}</span>
      </div>
   ); // note that the inner span tag is so that the draggable image will only be the number itself, not the whole width of the div
}

export default DraggableRowNumber;