import { useState, useCallback, useLayoutEffect, useRef, useMemo } from 'react';
import * as R from 'ramda';
import { isSomething } from '../helpers';
import { calcEditorPositioning } from '../helpers/focusHelpers';

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

const createEditorResizeObserver = ({ cellChanged, getCellPositioning, getUpdatedEditorPositioning, setEditorPositioning }) => {
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
							getUpdatedEditorPositioning,
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

const useResizeObserver = ({ editorRef, hasCellChanged, getCellPositioning, getUpdatedEditorPositioning, setEditorPositioning }) => {
	const [currentEditorRef, setCurrentEditorRef] = useState();

	if (editorRef?.current && currentEditorRef !== editorRef.current) {
		// we have a legit new editorRef.current, so make it our currentEditorRef
		setCurrentEditorRef(editorRef.current);
	}

	const cellChanged = hasCellChanged();

	const resizeObserver = useMemo(
		() => createEditorResizeObserver({ cellChanged, getCellPositioning, getUpdatedEditorPositioning, setEditorPositioning }),
		[cellChanged, getCellPositioning, getUpdatedEditorPositioning, setEditorPositioning]
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

// this is a bit dicey using "let" to essentially save the state, but methods like this were used in the
// library that did the react version of ResizeObserver. ALso it works, so leaving it as is
let _cell = null;
const isSameCell = (cell1, cell2) => {
	const row1 = R.prop('row', cell1);
	const row2 = R.prop('row', cell2);
	const column1 = R.prop('column', cell1);
	const column2 = R.prop('column', cell2);
	return row1 === row2 && column1 === column2;
}

export const useEditorPositioning = ({ cellPositioning, cell }) => {
	const [editorPositioning, setEditorPositioning] = useState();
	const getCellPositioning = () => cellPositioning;
	
	const hasCellChanged = () => !isSameCell(_cell, cell);
	if (hasCellChanged()) {
		_cell = cell;
	}

	const getUpdatedEditorPositioning = () => {
		if (hasCellChanged()) {
			R.pipe(calcEditorPositioning, setEditorPositioning)(cellPositioning); 
			return editorPositioning;
		}
		if (isSomething(editorPositioning)) {
			return editorPositioning;
		}
		if (isSomething(cellPositioning)) {
			R.pipe(calcEditorPositioning, setEditorPositioning)(cellPositioning);
		}
		// shouldn't get to here
		return editorPositioning;
	}

	getUpdatedEditorPositioning(); // runing this just to update editorPositioning, no need to capture the result, since it will be set locally as editorPositioning

	const editorRef = useRef(null);

	// this fires after the DOM layout has happend, but before the paint. 
	useLayoutEffect(
      () =>
         R.pipe(
            editorRef => editorRef?.current ? editorRef.current.getBoundingClientRect() : {},
            R.pick(['top', 'left', 'bottom', 'right', 'width', 'height']),
            setEditorPositioning
         )(editorRef),
      [editorRef]
   );

	useResizeObserver({ editorRef, hasCellChanged, getCellPositioning, getUpdatedEditorPositioning, setEditorPositioning });
	return [editorRef, editorPositioning, setEditorPositioning];
}