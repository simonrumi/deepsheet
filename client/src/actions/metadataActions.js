import managedStore from '../store';
import { 
   REPLACED_ALL_METADATA,
   POSTING_UPDATED_METADATA, 
   CLEAR_METADATA,
   HAS_CHANGED_METADATA,
   UPDATED_FROZEN_ROWS, 
   UPDATED_FROZEN_COLUMNS,
   REPLACED_FROZEN_ROWS,
   REPLACED_FROZEN_COLUMNS,
   REPLACED_ROW_HEIGHTS,
   REPLACED_COLUMN_WIDTHS,
   UPDATED_COLUMN_WIDTH,
   UPDATED_ROW_HEIGHT,
   UPDATED_COLUMN_FILTERS,
   UPDATED_ROW_FILTERS,
   REPLACED_COLUMN_FILTERS,
   REPLACED_ROW_FILTERS,
   UPDATED_COLUMN_VISIBILITY,
   REPLACED_COLUMN_VISIBILITY,
   UPDATED_ROW_VISIBILITY,
   REPLACED_ROW_VISIBILITY,
   UPDATED_TOTAL_COLUMNS,
   UPDATED_TOTAL_ROWS,
   UPDATED_AXIS_ITEM_TOOL,
   HIDE_AXIS_ITEM_TOOL,
   ROW_MOVED,
   ROW_MOVED_TO,
   COLUMN_MOVED,
   COLUMN_MOVED_TO,
   UPDATED_ROW_ORDER,
   UPDATED_COLUMN_ORDER,
   UPDATED_PARENT_SHEET_ID,
} from './metadataTypes';

import { CELLS_UPDATED } from './cellTypes';

export const replacedAllMetadata = metadata => {
   managedStore.store.dispatch({
      type: REPLACED_ALL_METADATA,
      payload: metadata,
   });
}

export const updatedMetadata = async data => {
   managedStore.store.dispatch({
      type: POSTING_UPDATED_METADATA,
      payload: data,
   });
};

export const clearMetadata = () => {
   managedStore.store.dispatch({
      type: CLEAR_METADATA
   });
}

export const hasChangedMetadata = () => {
   managedStore.store.dispatch({
      type: HAS_CHANGED_METADATA,
   });
};

export const updatedFrozenRows = frozenRows => {
   managedStore.store.dispatch({
      type: UPDATED_FROZEN_ROWS,
      payload: frozenRows
   });
};

export const updatedFrozenColumns = frozenColumns => {
   managedStore.store.dispatch({
      type: UPDATED_FROZEN_COLUMNS,
      payload: frozenColumns
   });
};

export const replacedFrozenRows = frozenRows => {
   managedStore.store.dispatch({
      type: REPLACED_FROZEN_ROWS,
      payload: frozenRows
   });
};

export const replacedFrozenColumns = frozenColumns => {
   managedStore.store.dispatch({
      type: REPLACED_FROZEN_COLUMNS,
      payload: frozenColumns
   });
};

export const replacedRowHeights = rowHeights => {
   managedStore.store.dispatch({
      type: REPLACED_ROW_HEIGHTS,
      payload: rowHeights
   });
}

export const replacedColumnWidths = columnWidths => {
   managedStore.store.dispatch({
      type: REPLACED_COLUMN_WIDTHS,
      payload: columnWidths
   });
}

export const updatedColumnWidth = (index, size) => {
   managedStore.store.dispatch({
      type: UPDATED_COLUMN_WIDTH,
      payload: { index, size }
   });
};

export const updatedRowHeight = (index, size) => {
   managedStore.store.dispatch({
      type: UPDATED_ROW_HEIGHT,
      payload: { index, size }
   });
};

// Note - not doing anything with the data sent in CELLS_UPDATED action
// BUT maybe not worth the effort to unwind it....and possibly could be useful one day

export const updatedColumnFilters = newColumnFilter => {
   managedStore.store.dispatch({
      type: UPDATED_COLUMN_FILTERS,
      payload: newColumnFilter,
   });
   managedStore.store.dispatch({
      type: CELLS_UPDATED,
      payload: { changeType: UPDATED_COLUMN_FILTERS, data: newColumnFilter }
   });
};

export const updatedRowFilters = newRowFilter => {
   managedStore.store.dispatch({
      type: UPDATED_ROW_FILTERS,
      payload: newRowFilter,
   });
   managedStore.store.dispatch({
      type: CELLS_UPDATED,
      payload: { changeType: UPDATED_ROW_FILTERS, data: newRowFilter }
   });
};

export const replacedColumnFilters = columnFilters => {
   managedStore.store.dispatch({
      type: REPLACED_COLUMN_FILTERS,
      payload: columnFilters,
   });
   managedStore.store.dispatch({
      type: CELLS_UPDATED,
      payload: { changeType: REPLACED_COLUMN_FILTERS, data: columnFilters }
   });
};

export const replacedRowFilters = rowFilters => {
   managedStore.store.dispatch({
      type: REPLACED_ROW_FILTERS,
      payload: rowFilters,
   });
   managedStore.store.dispatch({
      type: CELLS_UPDATED,
      payload: { changeType: REPLACED_ROW_FILTERS, data: rowFilters }
   });
};

export const updatedColumnVisibility = newVisibility => {
   managedStore.store.dispatch({
      type: UPDATED_COLUMN_VISIBILITY,
      payload: newVisibility,
   });
   managedStore.store.dispatch({
      type: CELLS_UPDATED,
      payload: { changeType: UPDATED_COLUMN_VISIBILITY, data: newVisibility }
   });
};

export const replacedColumnVisibility = newVisibility => {
   managedStore.store.dispatch({
      type: REPLACED_COLUMN_VISIBILITY,
      payload: newVisibility,
   });
   managedStore.store.dispatch({
      type: CELLS_UPDATED,
      payload: { changeType: REPLACED_COLUMN_VISIBILITY, data: newVisibility }
   });
};

export const updatedRowVisibility = newVisibility => {
   managedStore.store.dispatch({
      type: UPDATED_ROW_VISIBILITY,
      payload: newVisibility,
   });
   managedStore.store.dispatch({
      type: CELLS_UPDATED,
      payload: { changeType: UPDATED_ROW_VISIBILITY, data: newVisibility }
   });
};

export const replacedRowVisibility = newVisibility => {
   managedStore.store.dispatch({
      type: REPLACED_ROW_VISIBILITY,
      payload: newVisibility,
   });
   managedStore.store.dispatch({
      type: CELLS_UPDATED,
      payload: { changeType: REPLACED_ROW_VISIBILITY, data: newVisibility }
   });
};

export const updatedTotalColumns = (oldTotalColumns, newTotalColumns) => {
   managedStore.store.dispatch({
      type: UPDATED_TOTAL_COLUMNS,
      payload: newTotalColumns,
   });
   managedStore.store.dispatch({
      type: CELLS_UPDATED,
      payload: { changeType: UPDATED_TOTAL_COLUMNS, data: { oldTotalColumns, newTotalColumns } }
   });
};

export const updatedTotalRows = (oldTotalRows, newTotalRows) => {
   managedStore.store.dispatch({
      type: UPDATED_TOTAL_ROWS,
      payload: newTotalRows,
   });
   managedStore.store.dispatch({
      type: CELLS_UPDATED,
      payload: { changeType: UPDATED_TOTAL_ROWS, data: { oldTotalRows, newTotalRows } }
   });
};

export const updatedAxisItemTool = axisItemTooldata => {
   managedStore.store.dispatch({
      type: UPDATED_AXIS_ITEM_TOOL,
      payload: axisItemTooldata
   });
};

export const hideAxisItemTool = () => {
   managedStore.store.dispatch({
      type: HIDE_AXIS_ITEM_TOOL
   });
}

export const rowMoved = ({ rowMoved, rowMovedTo }) => {
   managedStore.store.dispatch({
      type: ROW_MOVED,
      payload: rowMoved,
   });
   managedStore.store.dispatch({
      type: ROW_MOVED_TO,
      payload: rowMovedTo,
   });
   managedStore.store.dispatch({
      type: UPDATED_ROW_ORDER,
      payload: null,
   });
   managedStore.store.dispatch({
      type: CELLS_UPDATED,
      payload: { changeType: ROW_MOVED, data: { rowMoved, rowMovedTo } }
   });
};

export const columnMoved = ({ columnMoved, columnMovedTo }) => {
   managedStore.store.dispatch({
      type: COLUMN_MOVED,
      payload: columnMoved,
   });
   managedStore.store.dispatch({
      type: COLUMN_MOVED_TO,
      payload: columnMovedTo,
   });
   managedStore.store.dispatch({
      type: UPDATED_COLUMN_ORDER,
      payload: null,
   });
   managedStore.store.dispatch({
      type: CELLS_UPDATED,
      payload: { changeType: COLUMN_MOVED, data: { columnMoved, columnMovedTo } }
   });
};

export const updatedParentSheetId = parentSheetId => {
   managedStore.store.dispatch({
      type: UPDATED_PARENT_SHEET_ID,
      payload: parentSheetId,
   });
}