import { useState, useCallback } from 'react';

/** 
 * this is used to get the height, width, top, right, bottom & left coordinates of a component
 * to use it, place the ref on an element:
 * const [ref, positioning] = usePositioning();
 * <div ref={ref} > ...</div>
 * then you have access to positioning info like this:
 * const doubleHeight = positioning.height * 2;
*/
export const usePositioning = () => {
   const [positioning, setPositioning] = useState({});
   const ref = useCallback(node => {
      if (node !== null) {
         const rect = node.getBoundingClientRect();
         setPositioning({
            height: rect.height,
            width: rect.width,
            top: rect.top + window.scrollY,
            right: rect.right,
            bottom: rect.bottom,
            left: rect.left + window.scrollX,
         });
      }
   }, []);

   return [ref, positioning];
}