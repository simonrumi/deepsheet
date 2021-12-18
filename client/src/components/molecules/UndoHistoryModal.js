import React from 'react';
import * as R from 'ramda';
import managedStore from '../../store';
import { statePastActions, statePresentAction, stateFutureActions } from '../../helpers/dataStructureHelpers';
import { undid, redid, hidUndoHistory } from '../../actions/undoActions';
import ChevronRight from '../atoms/IconChevronRight';
import DraggableModal from '../atoms/DraggableModal';

const renderHistoryList = () => (
   <ul>
      {R.map(
         action => (
            <li className="hover:text-vibrant-blue cursor-pointer" key={action.timestamp} onClick={() => undid(action)}>
               {action.message}
            </li>
         ),
         statePastActions(managedStore.state)
      )}
		<li className="text-burnt-orange">{R.pipe(statePresentAction, R.prop('message'))(managedStore.state)}</li>
      {R.map(
         action => (
            <li className="text-grey-blue hover:text-vibrant-blue cursor-pointer" key={action.timestamp} onClick={() => redid(action)}>
               {action.message}
            </li>
         ),
         stateFutureActions(managedStore.state)
      )}
   </ul>
);

// TODO need to come up with better default positioning 
const positioning = { left: 0, top: 0 }

const UndoHistoryModal = () => {
	return (
		<DraggableModal classes="absolute z-50" positioning={positioning}>
			<div className="bg-white border border-grey-blue pl-3">HISTORY</div>
			<div className="relative top-0 flex items-baseline bg-white border border-grey-blue shadow-lg p-3">
				{renderHistoryList()}
				<ChevronRight height="1.2em" width="1.2em" classes="pl-2" onClickFn={hidUndoHistory} /> 
			</div>
		</DraggableModal>
	);
}

export default UndoHistoryModal;
