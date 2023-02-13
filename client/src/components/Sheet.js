import * as R from 'ramda';
import React, { useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import managedStore from '../store';
import { triggeredFetchSheet } from '../actions/sheetActions';
import { cellsRedrawCompleted } from '../actions/cellActions';
import {
   isNothing,
	isSomething,
   arrayContainsSomething,
   forLoopReduce,
   getObjectFromArrayByKeyValue,
} from '../helpers';
import { has401Error } from '../helpers/authHelpers';
import {
	floatingCellNumber,
	floatingCellPosition,
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
   stateColumnVisibility,
   stateRowVisibility,
   stateTotalRows,
   stateTotalColumns,
   stateCellsRenderCount,
	stateHasErrorMessages,
   stateGlobalInfoModalIsVisible,
	stateShowUndoHistory,
	stateFocusCell,
} from '../helpers/dataStructureHelpers';
import { isVisibilityCalculated } from '../helpers/visibilityHelpers';
import { isAxisSizingCalculated,handleResizerDragOver, handleResizerDrop } from '../helpers/axisSizingHelpers';
import { getUserInfoFromCookie } from '../helpers/userHelpers';
import { haveCellsNeedingUpdate } from '../helpers/cellHelpers';
import {
   ROW_AXIS,
   COLUMN_AXIS,
   THIN_COLUMN,
   THIN_ROW,
   DEFAULT_ROW_HEIGHT,
   DEFAULT_COLUMN_WIDTH,
	LOG,
} from '../constants';
import { log } from '../clientLogger';
import LoadingIcon from './atoms/IconLoading';
import Header from './Header';
import Cells from './Cells';
import FilterModal from './organisms/FilterModal';
import SortModal from './organisms/SortModal';
import PasteOptionsModal from './molecules/PasteOptionsModal';
import LoginModal from './organisms/LoginModal';
import GlobalErrorModal from './organisms/GlobalErrorModal';
import GlobalInfoModal from './organisms/GlobalInfoModal';
import UndoHistory from './molecules/UndoHistoryModal';
import AddFloatingCellBtn from './molecules/AddFloatingCellBtn';
import FloatingCells from './molecules/FloatingCells';

const compareSizesByIndex = (size1, size2) => {
   if (size1.index === size2.index) {
      return 0;
   }
   return size1.index > size2.index ? 1 : -1;
};

const createDefaultAxisSizes = axis => {
   // the following will generate a string like ' 2em 2em 2em 2em ' (as many values as there are items in the axis)
   const totalItems = axis === ROW_AXIS ? stateTotalRows(managedStore.state) : stateTotalColumns(managedStore.state);
   const defaultSize = axis === ROW_AXIS ? DEFAULT_ROW_HEIGHT : DEFAULT_COLUMN_WIDTH
   return forLoopReduce(
      (accumulator, index) => accumulator + defaultSize + ' ', 
      ' ', 
      totalItems
   );
}

const createAxisSizes = (axisSizes = [], axisVisibility, axis) => {
   if (!arrayContainsSomething(axisSizes)) {
      return createDefaultAxisSizes(axis);
   }
   // the following will generate a string like ' 40px 100px 29px 51px '
   const sizesOrderedByIndex = R.sort(compareSizesByIndex, axisSizes);
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

const getAxisSizing = ({ axis, columnWidths, columnVisibility, rowHeights, rowVisibility }) =>
   axis === COLUMN_AXIS
      ? createAxisSizes(columnWidths, columnVisibility, COLUMN_AXIS)
      : createAxisSizes(rowHeights, rowVisibility, ROW_AXIS);

const getGridSizingStyle = ({ columnWidths, columnVisibility, rowHeights, rowVisibility }) => {
	log({ level: LOG.SILLY }, 'Sheet--getGridSizingStyle got columnWidths', columnWidths, 'columnVisibility', columnVisibility, 'rowHeights', rowHeights, 'rowVisibility', rowVisibility);
	const contentRows = getAxisSizing({ axis: ROW_AXIS, rowHeights, rowVisibility });
	const contentColumns = getAxisSizing({ axis: COLUMN_AXIS, columnWidths, columnVisibility });
	const rowsStyle = THIN_ROW + contentRows + THIN_ROW; // the THIN_ROWs are for the ColumnHeader at the top and the RowAdder at the bottom
	const columnsStyle = THIN_COLUMN + contentColumns + THIN_COLUMN; // the THIN_COLUMNs are for the RowHeaders on the left and the ColumnAdder on the right
	return {
		gridTemplateRows: rowsStyle,
		gridTemplateColumns: columnsStyle,
	};
}

const Sheet = () => {
	log({ level: LOG.DEBUG }, '\n\n***Sheet started');
   const isLoggedIn = useSelector(state => stateIsLoggedIn(state));
	const hasErrors = useSelector(state => stateHasErrorMessages(state));
   const showFilterModal = useSelector(state => stateShowFilterModal(state));
   const showSortModal = useSelector(state => stateShowSortModal(state));
   const showLoginModal = useSelector(state => stateShowLoginModal(state));
   const sheetIsCallingDb = useSelector(state => stateSheetIsCallingDb(state));
   const columnWidths = useSelector(state => stateColumnWidths(state));
   const rowHeights = useSelector(state => stateRowHeights(state));
   const columnVisibility = useSelector(state => stateColumnVisibility(state));
   const rowVisibility = useSelector(state => stateRowVisibility(state));
   const sheetId = useSelector(state => stateSheetId(state));
   const cellsLoaded = useSelector(state => stateSheetCellsLoaded(state));
   const globalInfoModalIsVisible = useSelector(state => stateGlobalInfoModalIsVisible(state));
	const showHistory = useSelector(state => stateShowUndoHistory(state));
	const cellWithFocus = useSelector(state => stateFocusCell(state));
	console.log('Sheet got cellWithFocus', cellWithFocus);

	const renderFloatingCells = () => {
		console.log('Sheet--renderFloatingCells started');
		return (<>
			<AddFloatingCellBtn sheetId={sheetId} />
			<FloatingCells />
		</>)
	}

   const cellsRenderCount = stateCellsRenderCount(managedStore.state); // not getting this value using useSelector as we don't want to retrigger a render when it changes (useEffect below manages the re-render)
   const memoizedCells = useMemo(() => {
      return <Cells renderCount={cellsRenderCount}/>;
   }, [cellsRenderCount]);

   const memoizedGridSizingStyle = useMemo(
      () =>
         getGridSizingStyle({
            columnWidths,
            rowHeights,
            columnVisibility,
            rowVisibility,
         }),
      [columnWidths, rowHeights, columnVisibility, rowVisibility]
   );

   const renderGridSizingStyle = () =>
      isVisibilityCalculated(managedStore.state) && isAxisSizingCalculated() 
			? memoizedGridSizingStyle : null;

   const renderCells = () => {
      return (<div
         className="grid gap-x-0 gap-y-0 justify-items-start items-start pt-1"
         style={renderGridSizingStyle()}
         onDragOver={handleResizerDragOver}
         onDrop={handleResizerDrop}>
            {memoizedCells}
      </div>);
   }
  
   /**
    * useEffect runs after the DOM is updated, so then we can fire cellsRedrawCompleted which increments the cellsRenderCount
    * that in turn will cause the useMemo above to redraw the cells next time through (perhaps incrementing cellsRenderCount causes a rerender?)
    */
   useEffect(() => {
      if (cellsLoaded && haveCellsNeedingUpdate(managedStore.state)) {
         cellsRedrawCompleted();
      }
   });

   const maybeRenderLoginOrFetchSheet = () => {
      const { userId, sessionId } = getUserInfoFromCookie();
      if (
         showLoginModal ||
         isLoggedIn === false ||
         !userId ||
         !sessionId  ||
         has401Error(stateSheetErrorMessage(managedStore.state))
      ) {
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

	const maybeRenderHistoryModal = () => showHistory ? <UndoHistory /> : null;

   const maybeRenderFilterModal = () => (showFilterModal ? <FilterModal /> : null);

   const maybeRenderSortModal = () => (showSortModal ? <SortModal /> : null);

   const maybeRenderGlobalErrorModal = () => hasErrors ? <GlobalErrorModal /> : null;

   const maybeRenderGlobalInfoModal = () => !hasErrors && globalInfoModalIsVisible ? <GlobalInfoModal /> : null;

   // the header is in a fixed position, but we want the spreadsheet to get pushed down below the header, so we use this spacer
   // when scrolling the spreadhsheet appears to scroll under the header
   const renderHeaderSpacer = () => {
      const headerHeight = document.getElementById('header')?.clientHeight || '4em'; // probably the 4em never gets displayed, just during initial rendering the id 'header' is sometimes undefined
      const style = { height: headerHeight }
      return <div style={style} ></div>
   }

	const handleDrop = event => {
		event.preventDefault();
		// setIsOver(false);
				
   }

   const handleDragOver = event => {
		event.preventDefault(); // doing this allows the drop
		event.dataTransfer.dropEffect = 'move'; // not sure how necessary this is
		// setIsOver(true);
   }

   const handleDragLeave = event =>  {
		// setIsOver(false);
   }

   const render = () => {
      if (sheetIsCallingDb) {
         return (
            <div className="m-auto max-w-md">
               <LoadingIcon />
            </div>
         );
      }
      return (
         <div 
				className="px-1" 
				id="sheet"
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
			>
            <Header />
            {renderHeaderSpacer()}
            {maybeRenderGlobalErrorModal()}
            {maybeRenderGlobalInfoModal()}
            {maybeRenderFilterModal()}
            {maybeRenderSortModal()}
				{maybeRenderHistoryModal()}
				<PasteOptionsModal />
            {maybeRenderLoginOrFetchSheet()}
            {renderCells()}
				{renderFloatingCells()}
         </div>
      );
   }

   return render();
}

export default Sheet;
