import * as R from 'ramda';
import { removeObjectFromArrayByKeyValue, isSomething, maybeHasPath } from '../helpers';
import { updatedAxisFilters, updateOrAddPayloadToState } from '../helpers/visibilityHelpers';
import {
   HAS_CHANGED_METADATA,
   POSTING_UPDATED_METADATA,
   COMPLETED_SAVE_METADATA,
   METADATA_UPDATE_FAILED,
   UPDATED_FROZEN_ROWS,
   UPDATED_FROZEN_COLUMNS,
   REPLACED_FROZEN_ROWS,
   REPLACED_FROZEN_COLUMNS,
   UPDATED_COLUMN_VISIBILITY,
   REPLACED_COLUMN_VISIBILITY,
   UPDATED_ROW_VISIBILITY,
   REPLACED_ROW_VISIBILITY,
   UPDATED_COLUMN_FILTERS,
   REPLACED_COLUMN_FILTERS,
   UPDATED_ROW_FILTERS,
   REPLACED_ROW_FILTERS,
   RESET_VISIBLITY,
   UPDATED_TOTAL_COLUMNS,
   UPDATED_TOTAL_ROWS,
   ROW_MOVED,
   ROW_MOVED_TO,
   COLUMN_MOVED,
   COLUMN_MOVED_TO,
   REPLACED_ROW_HEIGHTS,
   REPLACED_COLUMN_WIDTHS,
   UPDATED_COLUMN_WIDTH,
   UPDATED_ROW_HEIGHT,
   UPDATED_AXIS_ITEM_TOOL,
   HIDE_AXIS_ITEM_TOOL,
} from '../actions/metadataTypes';
import { UPDATED_SORT_OPTIONS, CLEARED_SORT_OPTIONS } from '../actions/sortTypes';
import { FETCHED_SHEET, COMPLETED_CREATE_SHEET } from '../actions/sheetTypes';

const metadataReducer = (state = {}, action) => {
   switch (action.type) {
      case FETCHED_SHEET:
         return maybeHasPath(['payload', 'metadata'], action);

      case COMPLETED_CREATE_SHEET:
         return R.pipe(
            maybeHasPath(['payload', 'sheet', 'metadata']),
            R.assoc('columnVisibility', []),
            R.assoc('rowVisibility', []),
          )(action)

      case HAS_CHANGED_METADATA: {
         return { ...state, isStale: true };
      }

      case UPDATED_COLUMN_VISIBILITY:
         const oldColumnValueRemoved = removeObjectFromArrayByKeyValue(
            'index',
            action.payload.index,
            state.columnVisibility
         );
         const newColumnVisibility = R.append(action.payload, oldColumnValueRemoved);
         return { ...state, columnVisibility: newColumnVisibility };

      case REPLACED_COLUMN_VISIBILITY:
         return { ...state, columnVisibility: action.payload };

      case UPDATED_ROW_VISIBILITY:
         const oldRowValueRemoved = removeObjectFromArrayByKeyValue('index', action.payload.index, state.rowVisibility);
         const newRowVisibility = R.append(action.payload, oldRowValueRemoved);
         return { ...state, rowVisibility: newRowVisibility };

      case REPLACED_ROW_VISIBILITY:
         return { ...state, rowVisibility: action.payload };

      case RESET_VISIBLITY:
         return {
            ...state,
            columnVisibility: [],
            rowVisibility: [],
            columnFilters: [],
            rowFilters: [],
         };

      case UPDATED_COLUMN_FILTERS:
         return updatedAxisFilters(action.payload, 'columnFilters', state, state.columnFilters);

      case REPLACED_COLUMN_FILTERS:
         return { ...state, columnFilters: action.payload };

      case UPDATED_ROW_FILTERS:
         return updatedAxisFilters(action.payload, 'rowFilters', state, state.rowFilters);

      case REPLACED_ROW_FILTERS:
         return { ...state, rowFilters: action.payload };

      case UPDATED_TOTAL_COLUMNS:
         return { ...state, totalColumns: action.payload };

      case UPDATED_TOTAL_ROWS:
         return { ...state, totalRows: action.payload };

      case ROW_MOVED:
         return { ...state, rowMoved: action.payload };

      case ROW_MOVED_TO:
         return { ...state, rowMovedTo: action.payload };

      case COLUMN_MOVED:
         return { ...state, columnMoved: action.payload };

      case COLUMN_MOVED_TO:
         return { ...state, columnMovedTo: action.payload };

      case UPDATED_SORT_OPTIONS:
         const { columnSortByIndex, rowSortByIndex, sortType, sortDirection } = action.payload;
         return typeof action.payload.rowSortByIndex === 'number'
            ? {
                  ...state,
                  rowSortByIndex,
                  rowSortDirection: sortDirection,
                  sortType,
              }
            : {
                  ...state,
                  columnSortByIndex,
                  columnSortDirection: sortDirection,
                  sortType,
              };

      case CLEARED_SORT_OPTIONS:
         return {
            ...state,
            rowSortByIndex: null,
            rowSortDirection: null,
            columnSortByIndex: null,
            columnSortDirection: null,
         };

      case UPDATED_FROZEN_ROWS:
         const frozenRows = updateOrAddPayloadToState(action.payload, state.frozenRows);
         return {
            ...state,
            isStale: true,
            frozenRows
         }

      case UPDATED_FROZEN_COLUMNS:
         const frozenColumns = updateOrAddPayloadToState(action.payload, state.frozenColumns);
         return {
            ...state,
            isStale: true,
            frozenColumns
         };

      case REPLACED_FROZEN_ROWS:
         return {
            ...state,
            isStale: true,
            frozenRows: action.payload
         }
      
      case REPLACED_FROZEN_COLUMNS:
         return {
            ...state,
            isStale: true,
            frozenColumns: action.payload
         };
         
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
         const columnWidths = updateOrAddPayloadToState([action.payload], state.columnWidths || []);
         return {
            ...state,
            isStale: true,
            columnWidths
         }

      case UPDATED_ROW_HEIGHT:
         const rowHeights = updateOrAddPayloadToState([action.payload], state.rowHeights || []);
         return {
            ...state,
            isStale: true,
            rowHeights
         }

      case UPDATED_AXIS_ITEM_TOOL:
         return {
            ...state,
            axisItemTool: action.payload,
         }

      case HIDE_AXIS_ITEM_TOOL:
         return {
            ...state,
            axisItemTool: { ...state.axisItemTool, isVisible: false }
         }

      case POSTING_UPDATED_METADATA:
         return {
            ...state,
            isCallingDb: true,
            isStale: true,
            errorMessage: null,
            lastUpdated: isSomething(state.lastUpdated) ? state.lastUpdated : null,
         };

      case COMPLETED_SAVE_METADATA:
         return {
            ...state,
            isCallingDb: false,
            isStale: false,
            errorMessage: null,
            lastUpdated: action.payload.lastUpdated,
         };

      case METADATA_UPDATE_FAILED:
         return {
            ...state,
            isCallingDb: false,
            isStale: true,
            errorMessage: isSomething(action.payload.errorMessage) ? action.payload.errorMessage : null,
            lastUpdated: isSomething(state.lastUpdated) ? state.lastUpdated : null,
         };

      default:
         return state;
   }
};

export default metadataReducer;