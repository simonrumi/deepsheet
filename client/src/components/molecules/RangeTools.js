import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import * as R from 'ramda';
import managedStore from '../../store';
import { DEFAULT_COLUMN_WIDTH } from '../../constants';
import { DEFAULT_TITLE_FOR_SUBSHEET_FROM_CELL_RANGE } from '../displayText';
import { getObjectFromArrayByKeyValue, ifThen, isSomething, arrayContainsSomething } from '../../helpers';
import { getUserInfoFromCookie } from '../../helpers/userHelpers';
import { manageKeyBindings, manageTab, updateCellsInRange } from '../../helpers/focusHelpers';
import {
    calculateTotalForRow,
    calculateTotalForColumn,
    orderCellsInRange,
    createRowHeights,
    createColumnWidths,
 } from '../../helpers/rangeToolHelpers';
import {
   stateColumnWidths,
   stateCellRangeCells,
   stateCellRange,
   cellText,
   stateSheetId,
} from '../../helpers/dataStructureHelpers';
import { updatedClipboard } from '../../actions/clipboardActions';
import { clearedCellRange, clearedFocus } from '../../actions/focusActions';
import { createdSheet } from '../../actions/sheetActions';
import CopyIcon from '../atoms/IconCopy';
import NewDocIcon from '../atoms/IconNewDoc';
import Clipboard from '../organisms/Clipboard';

const triggerCreatedSheetAction = ({ cellRange }) => {
    const rows = calculateTotalForRow({ cells: cellRange.cells });
    const columns = calculateTotalForColumn({ cells: cellRange.cells });
    const orderedCells = orderCellsInRange(cellRange.cells);
    const title = DEFAULT_TITLE_FOR_SUBSHEET_FROM_CELL_RANGE;
    const parentSheetId = stateSheetId(managedStore.state);
    const parentSheetCell = orderedCells[0];
    const rowHeights = createRowHeights({ totalRows: rows, orderedCellRange: orderedCells });
    const columnWidths = createColumnWidths({ totalColumns: columns, orderedCellRange: orderedCells }); 
    const { userId } = getUserInfoFromCookie();
    createdSheet({
        rows,
        columns,
        title,
        parentSheetId,
        parentSheetCell,
        rowHeights,
        columnWidths,
        userId,
        cellRange: orderedCells,
    });
};

const parentClasses = 'absolute top-0 z-10 flex flex-col border border-grey-blue p-1 bg-white';

const getCellRangeAsText = () => {
    const cells = stateCellRangeCells(managedStore.state);
    return ifThen({
        ifCond: arrayContainsSomething,
        thenDo: R.reduce(
            (accumulator, cell) => isSomething(cellText(cell)) ? accumulator + cellText(cell) + '\t' : accumulator,
            ''
        ),
        params: { ifParams: [cells], thenParams: [cells] } // since cells is an array and since params could be arrays of individual parameters, need to put cells into a parent array for ifThen to send cells as a single parameter, rather than many
    });
}

const copyRange = () => {
    const allTextInRange = getCellRangeAsText();
    updatedClipboard({ text: allTextInRange, cellRange: stateCellRange(managedStore.state) });
}

// TODO this isn't quite working to clear the cell range...should just do what CellInPLaceEditor does
// seems like everything is happening correctly...but somehow the last cell isn't getting the trigger to re-render
const tabAwayFromRange = () => {
    console.log('**** TAB ****');
    updateCellsInRange(false); // false means we're finding then removing all the cells from the range
    console.log('**** TAB updateCellsInRange finished ****');
    clearedCellRange();
    console.log('**** TAB clearedCellRange finished ****');
}

const RangeTools = ({ cell }) => {
    const columnWidths = useSelector(state => stateColumnWidths(state));
    const [ copiedRange, setCopiedRange ]  = useState(false);
    const rangeToolsRef = useRef();
    const widthObj = getObjectFromArrayByKeyValue('index', cell.column, columnWidths);
    const topLeftPositioning = {
        left: widthObj?.size || DEFAULT_COLUMN_WIDTH,
        top: 0
    }

    const keyBindingsRangeTool = event => {
        // use https://keycode.info/ to get key values
        switch(event.keyCode) {
            case 67: // "C" for copy (paste is in CellInPlaceEditor)
                if (event.ctrlKey) {
                    handleCopyRange(event);
                }
                break;

            case 9: // tab
                manageTab({ event, cell, callback: tabAwayFromRange });
                break;
            
            default:
        }
    };

    const handleCopyRange = event => {
        event.preventDefault();
        copyRange();
        setCopiedRange(true);
    }

    useEffect(() => {
        manageKeyBindings({ event: null, cell, rangeToolsRef, keyBindings: keyBindingsRangeTool });
    })
    
    return (
        <div className={parentClasses} style={topLeftPositioning}>
            <div onMouseDown={handleCopyRange}>
                <Clipboard />
                <CopyIcon copiedRange={copiedRange} />
            </div>
            <NewDocIcon
                classes="w-6 flex-1 mb-1"
                onMouseDownFn={() => triggerCreatedSheetAction({ cellRange: stateCellRange(managedStore.state) })}
            />
        </div>
     );
     /* Note that onMouseDown is fired before onBlur, whereas onClick is after onBlur. 
     * this used to be critical when the editor was separated from the cell. Might not be now, but using
     * onMouseDown is not hurting */
}

export default RangeTools;