import React, { useRef, useState } from 'react';
import { startedDrag, endedDrag } from '../../actions/dragActions';
import { DRAGGABLE_MODAL } from '../../actions/dragTypes';

const DraggableModal = ({
   dragData = {},
   children,
   classes = '',
   positioning = {},
   showBorder = true,
   id = 'draggableModal',
	onDragEndFn = () => {},
}) => {
   const [isDragging, setIsDragging] = useState(false); // we have isDragging in the redux store also, but it's convenient to have it here so that we don't have to figure out if it is this particular component that is being dragged
   const [currentPosition, setCurrentPosition] = useState(positioning);
   const modalRef = useRef(null);

   const handleDragStart = event => {
      event.dataTransfer.effectAllowed = 'move'; // unclear as to whether this is necessary. MDN says to use it but doesn't seem to be in the example here: https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/dropEffect
      event.dataTransfer.setDragImage(modalRef.current, 0, 0);
      setIsDragging(true);
      startedDrag({ dragType: DRAGGABLE_MODAL, dragData: currentPosition });
   };

   const handleDragEnd = event => {
		console.log('DraggableModal--handleDragEnd got event', event);
      setIsDragging(false);
      setCurrentPosition({ ...positioning, left: event.clientX, top: event.clientY });
		onDragEndFn(event)
      endedDrag();
   };

   const allClasses = isDragging && showBorder ? 'border border-vibrant-blue ' + classes : classes; //

   return (
      <div
         className={allClasses}
         id={id}
         draggable="true"
         onDragStart={handleDragStart}
         onDragEnd={handleDragEnd}
         ref={modalRef}
         style={currentPosition}>
         {children}
      </div>
   );
};

export default DraggableModal;