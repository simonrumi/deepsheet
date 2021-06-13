import React from 'react';
import { focusedCell } from '../../actions/focusActions';
import { hidePopups } from '../../actions';
import { cellText } from '../../helpers/dataStructureHelpers';

const onCellClick = (event, cell) => {
   event.preventDefault();
   focusedCell(cell);
   hidePopups();
}

const SummaryCell = React.memo(
   ({ cell }) => (
      <div
         className="grid-item grid items-stretch cursor-pointer border-t border-l"
         onClick={event => onCellClick(event, cell)}
      >
         <div className="m-px p-px border border-pale-purple">
            {cellText(cell)}
         </div>
      </div>
   )
);

export default SummaryCell;