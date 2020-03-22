import React from 'react';
import { loadSheet } from '../../helpers';

const SubsheetCell = ({ sheetId, content }) => (
   <div
      className="grid-item border border-burnt-orange cursor-pointer"
      onClick={() => loadSheet(sheetId)}
   >
      <div>{content}</div>
   </div>
);

export default SubsheetCell;
