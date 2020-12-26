/* import {
   REPLACED_ROW_HEIGHTS,
   REPLACED_COLUMN_WIDTHS,
   UPDATED_COLUMN_WIDTH,
   UPDATED_ROW_HEIGHT,
} from '../actions/axisSizingTypes';
import { updateOrAddPayloadToState } from '../helpers/visibilityHelpers';

const axisSizingReducer = (state = {}, action) => {
   switch (action.type) {
      case REPLACED_ROW_HEIGHTS:
         return {
            ...state,
            rowHeights: action.payload,
         }

      case REPLACED_COLUMN_WIDTHS:
         return {
            ...state,
            columnWidths: action.payload,
         }

      case UPDATED_COLUMN_WIDTH:
         // payload should contain e.g { index: 2, size: '100px' }
         const columnWidths = updateOrAddPayloadToState(action.payload, state.columnWidths || []);
         return {
            ...state,
            isStale: true,
            columnWidths
         }

      case UPDATED_ROW_HEIGHT:
         const rowHeights = updateOrAddPayloadToState(action.payload, state.rowHeights || []);
         return {
            ...state,
            isStale: true,
            rowHeights
         }

      default:
         return state;
   }
};

export default axisSizingReducer; */