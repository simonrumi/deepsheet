// TODO get other metadata stuff in here, such as
// HAS_CHANGED_METADATA

import managedStore from '../store';
import { 
   REPLACED_ALL_METADATA,
   POSTING_UPDATED_METADATA, 
   HAS_CHANGED_METADATA,
   UPDATED_FROZEN_ROWS, 
   UPDATED_FROZEN_COLUMNS,
   REPLACED_FROZEN_ROWS,
   REPLACED_FROZEN_COLUMNS,
   REPLACED_ROW_HEIGHTS,
   REPLACED_COLUMN_WIDTHS,
   UPDATED_COLUMN_WIDTH,
   UPDATED_ROW_HEIGHT,
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
};

export const updatedParentSheetId = parentSheetId => {
   managedStore.store.dispatch({
      type: UPDATED_PARENT_SHEET_ID,
      payload: parentSheetId,
   });
}