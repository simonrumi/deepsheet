import { useState, useCallback, useLayoutEffect, useRef, useMemo } from 'react';
import * as R from 'ramda';
import { isSomething } from '../helpers';
import { calcEditorPositioning } from '../helpers/focusHelpers';
import { floatingCellNumber, cellRow, cellColumn } from '../helpers/dataStructureHelpers';

/** 
 * this is used to get the height, width, top, right, bottom & left coordinates of a component.
 * It is being used by the Cell component.
 * to use it, place the ref on an element:
 * const [ref, positioning] = usePositioning();
 * <div ref={ref} > ...</div>
 * then you have access to positioning info like this:
 * const doubleHeight = positioning.height * 2;
*/
export const usePositioning = cellCount => {
   const [positioning, setPositioning] = useState({});
	const [totalCells, setTotalCells] = useState(cellCount);

   const ref = useCallback(
		node => { // we get the node because this ref, which is returned below, is added as a ref to a Component
			if (node !== null) {
				const rect = node.getBoundingClientRect();
				const calculatedPositioning = {
					height: rect.height,
					width: rect.width,
					top: rect.top + window.scrollY,
					right: rect.right,
					bottom: rect.bottom,
					left: rect.left + window.scrollX,
				};

				if(totalCells !== cellCount) {
					setTotalCells(cellCount);
				} // using this to make totalCells a dependency, which will cause an update if the totalCells have changed

				setPositioning(calculatedPositioning);
			}
		}, 
		[totalCells, cellCount, setTotalCells] //dependencies
	);

   return [ref, positioning];
}

const createEditorResizeObserver = ({ cellChanged, getCellPositioning, getLatestEditorPositioning, setEditorPositioning }) => {
	let _mousedownListener, _mouseupListener, _mousedownHeight, _mousedownWidth;
	return {
		observe: editorRef => {
			_mousedownListener = editorRef.addEventListener(
				'mousedown', 
				event => {
				_mousedownWidth = event.target.offsetWidth
				_mousedownHeight = event.target.offsetHeight;
				}
			);

			_mouseupListener = editorRef.addEventListener(
				'mouseup', 
				event => {
					if (event.target.offsetWidth !== _mousedownWidth || event.target.offsetHeight !== _mousedownHeight) {
						R.pipe(
							getLatestEditorPositioning,
							R.assoc('width', event.target.offsetWidth),
							R.assoc('height', event.target.offsetHeight),
							setEditorPositioning,
						)({ cellPositioning: getCellPositioning(), cellChanged });
					}
				}
			);
		},

		unobserve: editorRef => {
			editorRef.removeEventListener('mouseup', _mouseupListener);
			editorRef.removeEventListener('mousedown', _mousedownListener);
		}
	}
}

const useResizeObserver = ({ editorRef, cellChanged, getCellPositioning, getLatestEditorPositioning, setEditorPositioning }) => {
	const [currentEditorRef, setCurrentEditorRef] = useState();

	if (editorRef?.current && currentEditorRef !== editorRef.current) {
		// we have a legit new editorRef.current, so make it our currentEditorRef
		setCurrentEditorRef(editorRef.current);
	}

	const resizeObserver = useMemo(
		() => createEditorResizeObserver({ cellChanged, getCellPositioning, getLatestEditorPositioning, setEditorPositioning }),
		[cellChanged, getCellPositioning, getLatestEditorPositioning, setEditorPositioning]
	);

	useLayoutEffect(
		() => {
			// safety check - we need to have editorRef.current
			if (!currentEditorRef) {
				return () => {};
			}
			resizeObserver.observe(currentEditorRef);

			// the returned function runs after the calling component - CellInPlaceEditor - unmounts
			return () => resizeObserver.unobserve(currentEditorRef);
		},
		[editorRef, resizeObserver, currentEditorRef]
	);
}

const isSameCell = (cell1, cell2) => {
	const cell1Number = floatingCellNumber(cell1);
	const cell2Number = floatingCellNumber(cell2);
	if (isSomething(cell1Number) && isSomething(cell2Number)) {
		// case 1: both cells are floating cells
		return cell1Number === cell2Number;
	}
	const row1 = cellRow(cell1);
	const row2 = cellRow(cell2);
	if (isSomething(row1) && isSomething(row2)) {
		// case 2: both cells are not floating cells
		const column1 = cellColumn(cell1);
		const column2 = cellColumn(cell2);
		return row1 === row2 && column1 === column2;
	}
	// case 3: one cell is floating and the other is not floating, so they can't be the same
	return false;
}

export const useEditorPositioning = ({ cellPositioning, cell }) => {
	const [currentCell, setCurrentCell] = useState();
	const [editorPositioning, setEditorPositioning] = useState();
	const getCellPositioning = () => cellPositioning;

	const cellChanged = !isSameCell(currentCell, cell);
	if(cellChanged) {
		setCurrentCell(cell);
	}

	const getLatestEditorPositioning = () => {
		const newPositioning = calcEditorPositioning(cellPositioning);
		if (cellChanged) { 
			setEditorPositioning(newPositioning);
			setCurrentCell(cell);
			return newPositioning;
		}
		if (isSomething(editorPositioning)) {
			return editorPositioning;
		}
		if (isSomething(cellPositioning)) {
			setEditorPositioning(newPositioning);
			return newPositioning
		}
		// shouldn't get to here
		return editorPositioning;
	}

	const latestEditorPositioning = getLatestEditorPositioning();

	const editorRef = useRef(null);

	// useLayoutEffect fires after the DOM layout has happend, but before the paint. 
	useLayoutEffect(
      () =>
         R.pipe(
            editorRef => editorRef?.current ? editorRef.current.getBoundingClientRect() : {},
            R.pick(['top', 'left', 'bottom', 'right', 'width', 'height']),
            setEditorPositioning
         )(editorRef),
      [editorRef]
   );

	useResizeObserver({ editorRef, cellChanged, getCellPositioning, getLatestEditorPositioning, setEditorPositioning });
	return [editorRef, latestEditorPositioning, setEditorPositioning];
}