import React, { useState } from 'react';
import * as R from 'ramda';
import managedStore from '../../store';
import { createdSheet } from '../../actions/sheetActions';
import { isSomething, ifThen } from '../../helpers';
import { createDefaultAxisSizing } from '../../helpers/axisSizingHelpers';
import { createCellKey } from '../../helpers/cellHelpers';
import { getUserInfoFromCookie } from '../../helpers/userHelpers';
import { getSystemClipboard } from '../../helpers/clipboardHelpers';
import {
   stateSheetId,
   stateClipboard,
   stateSystemClipboard,
	cellRow,
	cellColumn
} from '../../helpers/dataStructureHelpers';
import { getCellPlainText } from '../../helpers/richTextHelpers';
import NewDocIcon from '../atoms/IconNewDoc';
import CloseIcon from '../atoms/IconClose';
import PasteIcon from '../atoms/IconPaste';
import CheckmarkSubmitIcon from '../atoms/IconCheckmarkSubmit';
import {
   DEFAULT_TOTAL_ROWS,
   DEFAULT_TOTAL_COLUMNS,
   DEFAULT_COLUMN_WIDTH,
   DEFAULT_ROW_HEIGHT,
	CELL_EDITOR_TOOLS_LEFT_OFFSET,
	CELL_EDITOR_TOOLS_TOP_OFFSET,
   LOG,
	BOLD,
	ITALIC,
	UNDERLINE,
} from '../../constants';
import { log } from '../../clientLogger';

const triggerCreatedSheetAction = cell => {
   const rows = DEFAULT_TOTAL_ROWS;
   const columns = DEFAULT_TOTAL_COLUMNS;
   const title = getCellPlainText(cell) || null;
   const parentSheetId = stateSheetId(managedStore.state);
   const parentSheetCell = cell;
   const rowHeights = createDefaultAxisSizing(DEFAULT_TOTAL_ROWS, DEFAULT_ROW_HEIGHT);
   const columnWidths = createDefaultAxisSizing(DEFAULT_TOTAL_COLUMNS, DEFAULT_COLUMN_WIDTH);
   const { userId } = getUserInfoFromCookie();
   createdSheet({ rows, columns, title, parentSheetId, parentSheetCell, rowHeights, columnWidths, userId });
}

const createToolsPositioning = () => R.pipe(
		R.assoc('left', CELL_EDITOR_TOOLS_LEFT_OFFSET),
		R.assoc('top', CELL_EDITOR_TOOLS_TOP_OFFSET)
	)({});

const CellEditorTools = ({ handleSubmit, handleCancel, handleStyling, handlePaste, cell, editorPositioning, setEditorPositioning, editorRef }) => {
	// getting the system clipbaord is async,
	// so using a local state seems like a reasonable way to make it so that only the single CellInPlaceEditor changes,
	// rather than re-rendering every Cell, which would be the case if we gave systemClipboard as a param to CellInPlaceEditor // TODO BUG here - seems like copying to the system clipboard doesn't work
	const [systemClipboardLocal, setSystemClipboardLocal] = useState(stateSystemClipboard(managedStore.state));
	const [toolsPositioning, setToolsPositioning] = useState(0);
	R.pipe(
		createToolsPositioning,
		createdPositioning => ifThen({
			ifCond: !R.equals(createdPositioning.left, toolsPositioning.left) || !R.equals(createdPositioning.top, toolsPositioning.top),
			thenDo: setToolsPositioning,
			params: { thenParams: createdPositioning }
		})
	)();

	const renderPasteIcon = () =>
		isSomething(stateClipboard(managedStore.state)) || isSomething(systemClipboardLocal) 
			? <PasteIcon
				systemClipboard={systemClipboardLocal}
				classes="bg-white mb-1"
				svgClasses="w-6"
				onMouseDownFn={handlePaste}
			/>
			: null;

	const richTextIconStyle = 'bg-white mb-1 self-center cursor-pointer text-subdued-blue hover:text-vibrant-blue text-2xl font-bold leading-6';

	const toolId = R.pipe(createCellKey, R.concat('tool_'))(cellRow(cell), cellColumn(cell)); // TODO update this for floating cells!!! currently we get id=tool_cell_undefined_undefined

	const handleMouseUpOverTools = event => {
		R.pipe(
			R.assoc('width', editorRef?.current?.offsetWidth),
			R.assoc('height', editorRef?.current?.offsetHeight),
			setEditorPositioning
		)(editorPositioning)

		R.pipe(
         createToolsPositioning,
         setToolsPositioning,
			R.assoc('width', editorRef?.current?.offsetWidth)
      )();
	}

	const renderTools = () => {
		// if there is something on the system clipboard, then that affects whether we display the PasteIcon
		getSystemClipboard()
			.then(systemClipboard => {
				ifThen({
					ifCond: isSomething,
					thenDo: setSystemClipboardLocal,
					params: { ifParams: systemClipboard, thenParams: systemClipboard }
				});
			})
			.catch(err => {
				log({ level: LOG.ERROR }, 'Couldn\'t get system clipboard', err);
			});

		return (
			<div className="relative z-10 w-full" onMouseUp={handleMouseUpOverTools}>
				<div
					id={toolId}
					className="absolute top-0 flex justify-items-start bg-white border border-grey-blue shadow-lg p-1"
					style={toolsPositioning}
				>
					{/* onMouseDown is fired before onBlur, whereas onClick is after onBlur. 
					Since the textarea has the focus, clicking on NewDocIcon will cause
					the editor's onBlur to fire...but we need to call another action before the onBlur,
					hence the use of onMouseDown */}
					<div className="flex flex-col">
						<CheckmarkSubmitIcon classes="bg-white mb-1" svgClasses="w-6" onMouseDownFn={handleSubmit} />
						<CloseIcon classes="bg-white mb-1" svgClasses="w-6" onMouseDownFn={handleCancel} />
						{renderPasteIcon()}
						<NewDocIcon classes="mb-1" svgClasses="w-6" onMouseDownFn={() => triggerCreatedSheetAction(cell)} />
					</div>
					<div className="flex flex-col pl-2">
						<span
							className={richTextIconStyle}
							onMouseDown={event => handleStyling(event, BOLD)}>
							B
						</span>
						<span
							className={richTextIconStyle + ' italic'}
							onMouseDown={event => handleStyling(event, ITALIC)}>
							I
						</span>
						<span
							className={richTextIconStyle + ' underline'}
							onMouseDown={event => handleStyling(event, UNDERLINE)}>
							U
						</span>
					</div>
				</div>
			</div>
		);
	};

	return renderTools();
}

export default CellEditorTools;
