import { STARTED_DRAG, ENDED_DRAG } from '../actions/dragTypes';

const dragMonitorReducer = (state = {}, action) => {
   switch (action.type) {
      case STARTED_DRAG:
         const { dragType, dragData } = action.payload;
         return { 
            isDragging: true,
            dragType, 
            dragData,
         };

      case ENDED_DRAG:
         return { 
            isDragging: false,
            dragType: null, 
            dragData: null, 
         };

      default:
         return state;
   }
};

export default dragMonitorReducer;
