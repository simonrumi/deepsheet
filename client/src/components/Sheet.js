import * as R from 'ramda';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import managedStore from '../store';
import { triggeredFetchSheet } from '../actions/sheetActions';
import { isNothing, getObjectFromArrayByKeyValue } from '../helpers';
import {
   stateIsLoggedIn,
   stateShowLoginModal,
   stateSheetId,
   stateShowFilterModal,
   stateShowSortModal,
   stateSheetIsCallingDb,
   stateSheetCellsLoaded,
   stateSheetErrorMessage,
   stateColumnWidths,
   stateRowHeights,
   stateColumnFilters,
   stateColumnVisibility,
   stateRowFilters,
   stateRowVisibility,
   stateTotalRows,
   stateTotalColumns,
} from '../helpers/dataStructureHelpers';
import { isVisibilityCalcutated } from '../helpers/visibilityHelpers';
import { isAxisSizingCalculated,handleResizerDragOver, handleResizerDrop } from '../helpers/axisSizingHelpers';
import { getUserInfoFromCookie } from '../helpers/userHelpers';
import {
   ROW_AXIS,
   COLUMN_AXIS,
   THIN_COLUMN,
   THIN_ROW,
} from '../constants';
import LoadingIcon from './atoms/IconLoading';
import Header from './Header';
import Cells from './Cells';
import FilterModal from './organisms/FilterModal';
import SortModal from './organisms/SortModal';
import LoginModal from './organisms/LoginModal';

const Sheet = props => {
   const isLoggedIn = useSelector(state => stateIsLoggedIn(state));
   const showFilterModal = useSelector(state => stateShowFilterModal(state));
   const showSortModal = useSelector(state => stateShowSortModal(state));
   const showLoginModal = useSelector(state => stateShowLoginModal(state));
   const sheetIsCallingDb = useSelector(state => stateSheetIsCallingDb(state));
   const columnWidths = useSelector(state => stateColumnWidths(state));
   const rowHeights = useSelector(state => stateRowHeights(state));
   const columnFilters = useSelector(state => stateColumnFilters(state));
   const columnVisibility = useSelector(state => stateColumnVisibility(state));
   const rowFilters = useSelector(state => stateRowFilters(state));
   const rowVisibility = useSelector(state => stateRowVisibility(state));
   const sheetId = useSelector(state => stateSheetId(state));
   const cellsLoaded = useSelector(state => stateSheetCellsLoaded(state));
   const totalRows = useSelector(state => stateTotalRows(state));
   const totalColumns = useSelector(state => stateTotalColumns(state));

   const maybeRenderLoginOrFetchSheet = () => {
      const { userId, sessionId } = getUserInfoFromCookie();
      if (showLoginModal || isLoggedIn === false || !userId || !sessionId) {
         return <LoginModal />;
      }
      if (!sheetId) {
         return R.ifElse(
            R.pipe(stateSheetErrorMessage, isNothing),
            () => triggeredFetchSheet(), // fetch the sheet if there is no sheetId and no sheet error message
            state => <div>{stateSheetErrorMessage(state)}</div> // show the sheet error message if there's no sheetId
         )(managedStore.state);
      }
      return null;
   };

   const compareSizesByIndex = (size1, size2) => {
      if (size1.index === size2.index) {
         return 0;
      }
      return size1.index > size2.index ? 1 : -1;
   };

   const createAxisSizes = (axisSizes = [], axisVisibility) => {
      const sizesOrderedByIndex = R.sort(compareSizesByIndex, axisSizes);
      // the following will generate a string like ' 40px 100px 29px 51px '
      return R.reduce(
         (accumulator, sizeObj) => {
            const axisItemVisibility = getObjectFromArrayByKeyValue('index', sizeObj.index, axisVisibility);
            return isNothing(axisItemVisibility) || axisItemVisibility.isVisible // a column/row is visible if either there is no axis visibility entry for it, or if the entry isVisible
               ? accumulator + sizeObj.size + ' '
               : accumulator;
         },
         ' ',
         sizesOrderedByIndex
      );
   };

   const getAxisSizing = axis =>
      axis === COLUMN_AXIS
         ? createAxisSizes(columnWidths, columnVisibility)
         : createAxisSizes(rowHeights, rowVisibility);

   const getGridSizingStyle = () => {
      const contentRows = getAxisSizing(ROW_AXIS);
      const contentColumns = getAxisSizing(COLUMN_AXIS);
      const rowsStyle = THIN_ROW + contentRows + THIN_ROW; // the THIN_ROWs are for the ColumnHeader at the top and the RowAdder at the bottom
      const columnsStyle = THIN_COLUMN + contentColumns + THIN_COLUMN; // the THIN_COLUMNs are for the RowHeaders on the left and the ColumnAdder on the right
      return {
         gridTemplateRows: rowsStyle,
         gridTemplateColumns: columnsStyle,
      };
   }

   const memoizedGridSizingStyle = useMemo(
      getGridSizingStyle,
      [
         cellsLoaded,
         columnWidths,
         rowHeights,
         columnFilters,
         columnVisibility,
         rowFilters,
         rowVisibility,
         totalRows,
         totalColumns
      ]
   );

   const renderGridSizingStyle = () =>
      isVisibilityCalcutated() && isAxisSizingCalculated() ? memoizedGridSizingStyle : null;

   const maybeRenderFilterModal = () => (showFilterModal ? <FilterModal /> : null);

   const maybeRenderSortModal = () => (showSortModal ? <SortModal /> : null);

   const render = () => {
      if (sheetIsCallingDb) {
         return (
            <div className="m-auto max-w-md">
               <LoadingIcon />
            </div>
         );
      }

      return (
         <div className="px-1">
            <Header />
            {maybeRenderFilterModal()}
            {maybeRenderSortModal()}
            {maybeRenderLoginOrFetchSheet()}
            <div
               className="grid-container pt-1"
               style={renderGridSizingStyle()}
               onDragOver={handleResizerDragOver}
               onDrop={handleResizerDrop}>
               <Cells />
            </div>
         </div>
      );
   }

   return render();
}

export default Sheet;
