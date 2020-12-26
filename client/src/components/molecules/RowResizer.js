import React, { useRef, useState } from 'react';
import { startedDrag, endedDrag } from '../../actions/dragActions';
import { DRAGGABLE_ROW_RESIZER } from '../../constants';

const RowResizer = props => {
   const { rowIndex } = props;
   const [ isDragging, setIsDragging ]  = useState(false); // we have isDragging in the redux store also, but it's convenient to have it here so that we don't have to figure out if it is this particular component that is being dragged
   const rowResizerRef = useRef(null);

   const handleDragStart = event => {
      const startingYPos = event.target.getBoundingClientRect().y + window.scrollY; // getBoundingClientRect().top is relative to the viewport, so need to add scrollY to get relative to document
      event.dataTransfer.effectAllowed = 'move'; // unclear as to whether this is necessary. MDN says to use it but doesn't seem to be in the example here: https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/dropEffect
      event.dataTransfer.setDragImage(rowResizerRef.current, 0, 0); // use this RowResizer as the drag image instead of the browser from displaying its own drag image
      setIsDragging(true); 
      startedDrag({ dragType: DRAGGABLE_ROW_RESIZER, dragData: { rowIndex, startingYPos } });
   }

   const handleDragEnd = event => {
      setIsDragging(false);
      endedDrag();
   }

   const baseClasses = 'w-full self-end h-1 cursor-row-resize'; 
   const allClasses = isDragging ? baseClasses + ' bg-vibrant-blue' :  baseClasses + ' bg-grey-blue';
   return (
      <div
         className={allClasses}
         ref={rowResizerRef}
         draggable="true"
         onDragStart={handleDragStart}
         onDragEnd={handleDragEnd}>
      </div>
   );
}
export default RowResizer;
