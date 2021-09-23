import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import * as R from 'ramda';
import managedStore from '../../store';
import { DEFAULT_COLUMN_WIDTH } from '../../constants';
import { DEFAULT_TITLE_FOR_SUBSHEET_FROM_CELL_RANGE } from '../displayText';
import { getObjectFromArrayByKeyValue, ifThen, isSomething, arrayContainsSomething } from '../../helpers';
import { getUserInfoFromCookie } from '../../helpers/userHelpers';
import { manageKeyBindings, manageTab, updateCellsInRange, orderFromAndToAxes } from '../../helpers/focusHelpers';
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
    stateCellRangeFrom,
    stateCellRangeTo,
    stateCellRange,
    cellText,
    cellRow,
    cellColumn,
    cellInCellRange,
    stateSheetId,
} from '../../helpers/dataStructureHelpers';
import { updatedClipboard } from '../../actions/clipboardActions';
import { clearedCellRange } from '../../actions/focusActions';
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
    const { toRow, toColumn } = R.converge(
        orderFromAndToAxes, 
        [ stateCellRangeFrom, stateCellRangeTo ]
    )(managedStore.state); // this param is passed to both stateCellRangeFrom & stateCellRangeTo

    const cells = stateCellRangeCells(managedStore.state);
    return ifThen({
        ifCond: arrayContainsSomething,
        thenDo: R.reduce(
            (accumulator, cell) => {
                const cellEndChar = cellColumn(cell) === toColumn
                    ? cellRow(cell) === toRow 
                        ? '' // at the very last cell so no end char is needed
                        : '\n' // at the end of a row, so add a newline
                    : '\t'; // in the middle of a row, so add a tab
                return isSomething(cellText(cell)) ? accumulator + cellText(cell) + cellEndChar : accumulator + cellEndChar
            },
            '' // initial value is an empty string
        ),
        params: { ifParams: [cells], thenParams: [cells] } // since cells is an array and since params could be arrays of individual parameters, need to put cells into a parent array for ifThen to send cells as a single parameter, rather than many
    });
}

const copyRange = () => {
    const allTextInRange = getCellRangeAsText();
    console.log('RangeTools--copyRange got allTextInRange', allTextInRange);
    updatedClipboard({ text: allTextInRange, cellRange: stateCellRange(managedStore.state) });
}

const tabAwayFromRange = () => {
    updateCellsInRange(false); // false means we're finding then removing all the cells from the range
    clearedCellRange();
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
    const inCellRange = cellInCellRange(cell);

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
        if (inCellRange) {
            manageKeyBindings({ event: null, cell, rangeToolsRef, keyBindings: keyBindingsRangeTool });
        }
    });
    
    return inCellRange 
        ? (
        <div className={parentClasses} style={topLeftPositioning}>
            <div onMouseDown={handleCopyRange}>
                <Clipboard />
                <CopyIcon copiedRange={copiedRange} />
            </div>
            <NewDocIcon
                classes="w-6 flex-1 mb-1"
                onMouseDownFn={() => triggerCreatedSheetAction({ cellRange: stateCellRange(managedStore.state) })}
            />
        </div>)
        : null; // if we're not in a cell range don't do anything
     /* Note that onMouseDown is fired before onBlur, whereas onClick is after onBlur. 
     * this used to be critical when the editor was separated from the cell. Might not be now, but using
     * onMouseDown is not hurting */
}

export default RangeTools;