import React, { useRef, useState } from 'react';
import { startedDrag, endedDrag } from '../../actions/dragActions';
import { DRAGGABLE_COLUMN_RESIZER } from '../../actions/dragTypes';

const ColumnResizer = props => {
	const { columnIndex } = props;
   const [ isDragging, setIsDragging ]  = useState(false); // we have isDragging in the redux store also, but it's convenient to have it here so that we don't have to figure out if it is this particular component that is being dragged
	const columnResizerRef = useRef(null);

	const handleDragStart = event => {
      const startingXPos = event.target.getBoundingClientRect().x + window.scrollX; // getBoundingClientRect().top is relative to the viewport, so need to add scrollX to get relative to document
      event.dataTransfer.effectAllowed = 'move'; // unclear as to whether this is necessary. MDN says to use it but doesn't seem to be in the example here: https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/dropEffect
      event.dataTransfer.setDragImage(columnResizerRef.current, 0, 0); // use this RowResizer as the drag image instead of the browser from displaying its own drag image
      setIsDragging(true); 
      startedDrag({ dragType: DRAGGABLE_COLUMN_RESIZER, dragData: { columnIndex, startingXPos } });
   }

   const handleDragEnd = event => {
      setIsDragging(false);
      endedDrag();
	}
	
	const baseClasses = 'w-1 h-full self-end cursor-col-resize'; 
   const allClasses = isDragging ? baseClasses + ' bg-vibrant-blue' :  baseClasses + ' bg-grey-blue';
	return (
		<div 
			className={allClasses}
			ref={columnResizerRef}
			draggable="true"
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}>
		</div>
	);
}

export default ColumnResizer;
