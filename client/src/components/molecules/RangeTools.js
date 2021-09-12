import React from 'react';
import { useSelector } from 'react-redux';
import * as R from 'ramda';
import managedStore from '../../store';
import { DEFAULT_COLUMN_WIDTH } from '../../constants';
import { DEFAULT_TITLE_FOR_SUBSHEET_FROM_CELL_RANGE } from '../displayText';
import { getObjectFromArrayByKeyValue, ifThen, isSomething, arrayContainsSomething } from '../../helpers';
import { getUserInfoFromCookie } from '../../helpers/userHelpers';
import {
   stateColumnWidths,
   stateCellRangeCells,
   stateCellRange,
   cellText,
   stateSheetId,
} from '../../helpers/dataStructureHelpers';
import {
   calculateTotalForRow,
   calculateTotalForColumn,
   orderCellsInRange,
   createRowHeights,
   createColumnWidths,
} from '../../helpers/rangeToolHelpers';
import { updatedClipboard } from '../../actions/clipboardActions';
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

const copyRange = event => {
    event.preventDefault();
    const allTextInRange = getCellRangeAsText();
    updatedClipboard({ text: allTextInRange, cellRange: stateCellRange(managedStore.state) });
}

const RangeTools = ({ cell }) => {
    const columnWidths = useSelector(state => stateColumnWidths(state));
    const widthObj = getObjectFromArrayByKeyValue('index', cell.column, columnWidths);
    const topLeftPositioning = {
        left: widthObj?.size || DEFAULT_COLUMN_WIDTH,
        top: 0
    }
    
    return (
        <div className={parentClasses} style={topLeftPositioning}>
            <div onMouseDown={copyRange}>
                <Clipboard />
                <CopyIcon />
            </div>
            <NewDocIcon
                classes="w-6 flex-1 mb-1"
                onMouseDownFn={() => triggerCreatedSheetAction({ cellRange: stateCellRange(managedStore.state),  })}
            />
        </div>
     );
     /* Note that onMouseDown is fired before onBlur, whereas onClick is after onBlur. 
     * this used to be critical when the editor was separated from the cell. Might not be now, but using
     * onMouseDown is not hurting */
}

export default RangeTools;