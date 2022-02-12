import React from 'react';
import * as R from 'ramda';
import managedStore from '../../store';
import { openedTitleEditor } from '../../actions/titleActions';
import { hidePopups } from '../../actions';
import { undid, redid } from '../../actions/undoActions';
import { startedEditingTitle } from '../../actions/titleActions';
import { updatedInfoModalVisibility, updatedInfoModalContent } from '../../actions/infoModalActions';
import { showedUndoHistory } from '../../actions/undoActions';
import { loadSheet, saveAllUpdates } from '../../services/sheetServices';
import { isSomething, arrayContainsSomething, ifThen } from '../../helpers';
import { createCellId } from '../../helpers/cellHelpers';
import {
   stateParentSheetId,
   stateHasErrorMessages,
   stateCellRangeFrom,
   stateCellRangeTo,
   cellRow,
   cellColumn,
} from '../../helpers/dataStructureHelpers';
import { UNDO_TEST_ID, REDO_TEST_ID } from '../../__tests__/testHelpers/constants';
import { pasteInfoModalText } from '../displayText';
import Heading from '../atoms/Heading';
import IconUpArrow from '../atoms/IconUpArrow';
import SaveIcon from '../atoms/IconSave';
import PasteIcon from '../atoms/IconPaste';
import LoadingIcon from '../atoms/IconLoading';
import UndoIcon from '../atoms/IconUndo';
import RedoIcon from '../atoms/IconRedo';
import IconChevronLeft from '../atoms/IconChevronLeft';

const handleEditTitle = (event, initialValue) => {
   event.preventDefault();
   startedEditingTitle(initialValue);
   openedTitleEditor(true);
}

const SheetHeader = ({ title, past, future, isStale, isCallingDb, parentSheetId, rangeWasCopied, showHistory }) => {
   const handleSave = async () => {
      await saveAllUpdates(managedStore.state);
   }

   const renderUpArrow = () => {
      if (isSomething(parentSheetId)) {
         return (
            <IconUpArrow
               height="1.5em"
               width="1.5em"
               classes="pl-2"
               onClickFn={() => R.pipe(stateParentSheetId, loadSheet(managedStore.state))(managedStore.state)}
               data-testid="titleUpArrow"
            />
         );
      }
      return null;
   }

   const createPasteInfoText = ({ fromCell, toCell }) => {
      const fromCellName = createCellId(cellRow(fromCell), cellColumn(fromCell));
      const toCellName = createCellId(cellRow(toCell), cellColumn(toCell));
      return pasteInfoModalText({ fromCellName, toCellName });
   }

   const handlePasteIconClick = () => {
      const fromCell = stateCellRangeFrom(managedStore.state);
      const toCell = stateCellRangeTo(managedStore.state);
      return isSomething(fromCell) && isSomething(toCell)
         ? R.pipe(
            createPasteInfoText,
            updatedInfoModalContent,
            () => updatedInfoModalVisibility(true)
         )({ fromCell, toCell })
         : null;
   }

   const renderPasteIcon = () => ifThen({
		ifCond: () => rangeWasCopied ? true : false,
		thenDo: () => <PasteIcon height="1.5em" width="1.5em" classes="pr-2" onClickFn={handlePasteIconClick} />,
		params: { }
	});


   const renderSaveIcon = () => {
		if (isCallingDb) {
         return <LoadingIcon height="2em" width="2em" classes="pr-2" />;
      }
      if (isStale) {
         const classes = stateHasErrorMessages(managedStore.state) ? 'pr-2 text-burnt-orange ' : 'pr-2 text-vibrant-blue ';
			return <SaveIcon height="1.5em" width="1.5em" classes={classes} onClickFn={handleSave} />;
      }
   }

	const maybeRenderHistoryChevron = () => !showHistory && ((arrayContainsSomething(past) || arrayContainsSomething(future)))
		? <IconChevronLeft height="1.2em" width="1.2em" classes="text-subdued-blue hover:text-vibrant-blue pr-2" onClickFn={showedUndoHistory} />
		: null;

   const renderUndoRedoIcons = () => {
      const undoClasses = arrayContainsSomething(past) ? 'text-subdued-blue hover:text-vibrant-blue pr-2' : 'text-grey-blue pr-2';
      const redoClasses = arrayContainsSomething(future) ? 'text-subdued-blue hover:text-vibrant-blue' : 'text-grey-blue';
      return (
         <div className="flex items-center justify-between pr-2 pl-2 border">
				{maybeRenderHistoryChevron()}
            <UndoIcon height="1.5em" width="1.5em" classes={undoClasses} onClickFn={() => undid()} testId={UNDO_TEST_ID} />
            <RedoIcon height="1.5em" width="1.5em" classes={redoClasses} onClickFn={() => redid()} testId={REDO_TEST_ID} />
				
         </div>
      );
		// note that the undid and redid functions cannot be written like this onClickFn={undid} because then it calls undid(event), which breaks stuff
   }

   return (
      <div className="flex items-center justify-between px-2 py-1" onClick={hidePopups} key="SheetHeader">
         <Heading text={title} classes="pr-2" onClickFn={event => handleEditTitle(event, title)} />
         <div className="flex items-end justify-between">
            {renderPasteIcon()}
            {renderSaveIcon()}
            {renderUndoRedoIcons()}
            {renderUpArrow()}
         </div>
      </div>
   );
}

export default SheetHeader;