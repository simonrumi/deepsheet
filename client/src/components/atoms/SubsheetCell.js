import React from 'react';
import { loadSheet, fetchSummaryCellFromSheet } from '../../helpers';

const SubsheetCell = ({ sheetId }) => (
   <div
      className="grid-item border border-burnt-orange pointer"
      onClick={() => loadSheet(sheetId)}
   >
      <div>{fetchSummaryCellFromSheet(sheetId)}</div>
   </div>
);

export default SubsheetCell;
