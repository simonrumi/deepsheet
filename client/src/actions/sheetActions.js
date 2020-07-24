import * as R from 'ramda';
import managedStore from '../store';
import { createSheetMutation } from '../queries/sheetMutations';
import { cellText, cellSubsheetIdSetter, dbSheetId } from '../helpers/dataStructureHelpers';
import { getSavableCellData } from '../helpers/cellHelpers';
import { updatedCells } from './cellActions';
import { POSTING_CREATE_SHEET, COMPLETED_CREATE_SHEET, SHEET_CREATION_FAILED } from './sheetTypes';

// TODO BUG: after making subsheet from a cell, going back to parent sheet doesn't show which cells are subsheets

export const createdSheet = async ({ rows, columns, title, parentSheetId, summaryCell, parentSheetCell }) => {
   managedStore.store.dispatch({ type: POSTING_CREATE_SHEET });
   const summaryCellText = cellText(parentSheetCell);
   try {
      const response = await createSheetMutation({
         rows,
         columns,
         title,
         parentSheetId,
         summaryCell,
         summaryCellText,
      });

      const savableParentSheetCell = R.pipe(
         getSavableCellData,
         R.pipe(dbSheetId, cellSubsheetIdSetter)(response.data.createSheet)
      )(parentSheetCell); //note that "createSheet" is the name of the mutation in sheetMutation.js

      await updatedCells({ sheetId: parentSheetId, updatedCells: [savableParentSheetCell] });

      managedStore.store.dispatch({
         type: COMPLETED_CREATE_SHEET,
         payload: { sheet: response.data.createSheet },
      });
   } catch (err) {
      console.error('did not successfully create the sheet in the db: err:', err);
      managedStore.store.dispatch({
         type: SHEET_CREATION_FAILED,
         payload: { errorMessage: 'sheet was not created in the db: ' + err },
      });
   }
};
