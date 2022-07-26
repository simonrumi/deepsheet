import { useState, useCallback } from 'react';
import { updatedCellPositioning } from '../actions/cellActions';
import * as R from 'ramda';

/** 
 * this is used to get the height, width, top, right, bottom & left coordinates of a component
 * to use it, place the ref on an element:
 * const [ref, positioning] = usePositioning();
 * <div ref={ref} > ...</div>
 * then you have access to positioning info like this:
 * const doubleHeight = positioning.height * 2;
*/
export const usePositioning = (tempPrintNode, totalCells) => { // TIDY tempPrintNode is just for console logging - remove when not using ...also remove cell
   const [positioning, setPositioning] = useState({});
   const ref = useCallback(node => {
      if (node !== null) {
			if (tempPrintNode) { // TIDY
				console.log('usePositioning got node', node, 'totalCells', totalCells);
			}
         const rect = node.getBoundingClientRect();
			const calculatedPositioning = {
            height: rect.height,
            width: rect.width,
            top: rect.top + window.scrollY,
            right: rect.right,
            bottom: rect.bottom,
            left: rect.left + window.scrollX,
         };
         setPositioning(previousPositioning => {
				if (tempPrintNode) { // TIDY
					console.log(
						'hooks--usePositioning--setPositioning got previousPositioning', previousPositioning,
						'calculatedPositioning', calculatedPositioning,
						'are they equal?:', R.equals(previousPositioning, calculatedPositioning)
					);
				}
				return calculatedPositioning;
			});
			// updatedCellPositioning({ ...cell, positioning: calculatedPositioning }); // TIDY
      }
   }, [totalCells]);

   return [ref, positioning];
}