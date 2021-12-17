import managedStore from '../store';
import { isSomething, forLoopMap } from './index';
import { stateRowHeights, stateColumnWidths, stateDragType, stateDragData } from './dataStructureHelpers';
import { startedUndoableAction, completedUndoableAction } from '../actions/undoActions';
import { updatedRowHeight, updatedColumnWidth } from '../actions/metadataActions';
import { UPDATED_ROW_HEIGHT, UPDATED_COLUMN_WIDTH } from '../actions/metadataTypes';
import {
   ROW_AXIS,
   MIN_COLUMN_WIDTH,
   MIN_ROW_HEIGHT,
   DRAGGABLE_ROW_RESIZER,
   DRAGGABLE_COLUMN_RESIZER,
} from '../constants';
import { createUpdateRowHeightMessage, createUpdateColumnWidthMessage } from '../components/displayText';

export const createDefaultAxisSizing = (numItems, defaultSize) => forLoopMap(
      index => ({ index, size: defaultSize }),
      numItems
   );

export const isAxisSizingCalculated = () => 
   stateRowHeights(managedStore.state) 
   && stateColumnWidths(managedStore.state);

export const getAxisSizingName = axis => axis === ROW_AXIS ? 'rowHeights' : 'columnWidths';

export const handleResizerDrop = event => {
   switch (stateDragType(managedStore.state)) {
      // Note: DRAGGABLE_ROW_RESIZER & DRAGGABLE_COLUMN_RESIZER are very similar, but not combining into one function 
      // as it becomes too confusing when the words "row" and "column" are absent
      
      case DRAGGABLE_ROW_RESIZER:
         event.preventDefault();
         // Note: to get data the MDN docs say to communicate data from the drag source to the drop target, 
         // you should use this sort of thing:
         // JSON.parse(event.dataTransfer.getData('text/plain'));
         // but here we have the redux store, so using that instead
         const { rowIndex, startingYPos } = stateDragData(managedStore.state);
         if (isSomething(rowIndex)) {
            const yPos = event.clientY + window.scrollY; // event.clientY is relative to the viewport, so need to add scrollY to get relative to document
            const rowHeightDelta = yPos - startingYPos;
            const rowHeaderBoundingRect = document.getElementById('rowHeader_' + rowIndex)?.getBoundingClientRect();
            const newRowHeight = Math.max(rowHeaderBoundingRect?.height + rowHeightDelta, MIN_ROW_HEIGHT);
            startedUndoableAction({ undoableType: UPDATED_ROW_HEIGHT, timestamp: Date.now() });
            updatedRowHeight(rowIndex, newRowHeight + 'px');
				completedUndoableAction({
					undoableType: UPDATED_ROW_HEIGHT,
					message: createUpdateRowHeightMessage({ rowIndex }),
					timestamp: Date.now(),
				});
         }
         break;
      
      case DRAGGABLE_COLUMN_RESIZER:
         event.preventDefault();
         const { columnIndex, startingXPos } = stateDragData(managedStore.state);
         if (isSomething(columnIndex)) {
            const xPos = event.clientX + window.scrollX;
            const columnWidthDelta = xPos - startingXPos;
            const columnHeaderBoundingRect = document.getElementById('columnHeader_' + columnIndex)?.getBoundingClientRect();
            const newColumnWidth = Math.max(columnHeaderBoundingRect?.width + columnWidthDelta, MIN_COLUMN_WIDTH);
            startedUndoableAction({ undoableType: UPDATED_COLUMN_WIDTH, timestamp: Date.now() });
            updatedColumnWidth(columnIndex, newColumnWidth + 'px');
            completedUndoableAction({
					undoableType: UPDATED_COLUMN_WIDTH,
					message: createUpdateColumnWidthMessage({ columnIndex }),
					timestamp: Date.now(),
				});
         }
         break;

      default:
   }
}

export const handleResizerDragOver = event => {
   switch (stateDragType(managedStore.state)) {
      case DRAGGABLE_ROW_RESIZER:
      case DRAGGABLE_COLUMN_RESIZER:
         event.preventDefault(); // doing this allows the drop
         event.dataTransfer.dropEffect = 'move'; // not sure how necessary this is. Might just affect the cursor
         break;

      default:
   }
}