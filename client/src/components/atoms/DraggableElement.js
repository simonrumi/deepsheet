import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { startedDrag, endedDrag } from '../../actions/dragActions';
import { DRAGGABLE_MODAL } from '../../actions/dragTypes';
import { isNothing, isSomething } from '../../helpers';
import { FLOATING_CELL } from '../../constants';

const DraggableElement = ({
   dragData = {},
   children,
   classes = '',
   positioning = {},
   showBorder = true,
   id = 'draggableModal',
	onDragEndFn = () => {},
	onDragStartFn = () => {},
	elementType,
}) => {
   const [isDragging, setIsDragging] = useState(false); // we have isDragging in the redux store also, but it's convenient to have it here so that we don't have to figure out if it is this particular component that is being dragged
   const [currentPosition, setCurrentPosition] = useState({});
   const modalRef = useRef(null);

	console.log('DraggableElement started with local state currentPosition', currentPosition, 'and positioning prop (passed in)', positioning);

   const handleDragStart = event => {
      event.dataTransfer.effectAllowed = 'move'; // unclear as to whether this is necessary. MDN says to use it but doesn't seem to be in the example here: https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/dropEffect
      event.dataTransfer.setDragImage(modalRef.current, 0, 0);
      setIsDragging(true);
		onDragStartFn(event);
      startedDrag({ dragType: DRAGGABLE_MODAL, dragData: currentPosition });
		console.log('DraggableElement-handleDragStart got currentPosition', currentPosition);
   };

   const handleDragEnd = event => {
		console.log('DraggableElement-handleDragEnd started with event.clientX', event.clientX, 'event.clientY', event.clientY);
      setIsDragging(false);
      setCurrentPosition({ ...positioning, left: event.clientX, top: event.clientY });
		onDragEndFn(event)
      endedDrag();
		console.log('DraggableElement-handleDragEnd just setCurrentPosition to', currentPosition);
   };

   const allClasses = isDragging && showBorder ? 'border border-vibrant-blue ' + classes : classes;

	useEffect(() => {
		console.log('DraggableElement-useEffect got currentPosition', currentPosition, 'and positioning', positioning);
		if (isNothing(currentPosition.left) || isNothing(currentPosition.top)) {
			setCurrentPosition(positioning);
			console.log('DraggableElement-useEffect just setCurrentPosition to positioning');
		}
		// putting this here so that on first render, the positioning prop affects where the element shows up.
		// previously we didn't have useEffect and just did this at the top:
		// const [currentPosition, setCurrentPosition] = useState({positioning});
		// ...but then the positioning value was getting set after the render, so it had no effect
	}, [currentPosition, positioning]); 

	useEffect(() => {
		console.log('DraggableElement-useEffect2 got currentPosition', currentPosition, 'positioning', positioning, 'elementType', elementType);
		// TODO after the undo, the new positioning passed in is correct, whereas currentPosition is outdated
		// this if statement below runs...BUT there is no redraw happening it seems, so it has no effect
		// maybe need some global way to deal with redrawing DraggableElements ?
		// OR might be better to look at the useEffect in Sheet.js to see how sheet.cellsRenderCount and sheet.cellsUpdateInfo is used to trigger redrawing
		// myabe need to do the equivalent thing for floatingCells ?
		// BUT FIRST look at why editing the floating cell causes a redraw
		if (
			elementType === FLOATING_CELL &&
			isSomething(currentPosition.left) && isSomething(positioning.left) &&
			isSomething(currentPosition.top) && isSomething(positioning.top) &&
			(currentPosition.left !== positioning.left || currentPosition.top !== positioning?.top)
		) {
			setCurrentPosition(positioning);
			console.log('DraggableElement-useEffect2 just setCurrentPosition to positioning');
		}
		
		
	}, [currentPosition, positioning]);

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

export default DraggableElement;