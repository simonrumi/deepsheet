import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { undid, redid } from '../actions/undoActions';
import { clearedCellRange } from '../actions/focusActions';
import { hideAllPopups } from '../actions';
import { updateCellsInRange } from '../helpers/focusHelpers';
import Sheet from './Sheet';
import ModalBackground from './atoms/ModalBackground';
import Footer from './molecules/Footer';

const keyBindings = event => {
   // note that metaKey detects both the command key on the Mac but also (in some browsers) the windows key.
   // this is ok - just means that windows-key + Z will also undo
   if (event.ctrlKey || event.metaKey) {
      // ctrl/cmd + Z
      if (event.keyCode === 90) {
         undid();
      }
      // ctrl/cmd + Y
      if(event.keyCode === 89) {
         redid();
      }
   }
   if (event.keyCode === 27) { //esc
      hideAllPopups();
      updateCellsInRange(false);
      clearedCellRange({ cell: null });
   }
}

const App = props => {
   useEffect(() => {
      document.addEventListener('keydown', keyBindings, false);
   }, []);

   logState(props.state);
   return (
      <div>
         <ModalBackground />
         <div className="min-h-screen pb-1">
            <Sheet />
         </div>
         <div className="w-full h-1 object-none object-bottom absolute">
            <Footer />
         </div>
      </div>
   );
};

const stateKeys = [
   'auth',
   'cellKeys',
   'cellDbUpdates',
   'clipboard',
   'dragMonitor',
   'filterModal',
   'focus',
   'menu',
   'metadata',
   'sheet',
   'sheets',
   'sortModal',
   'title',
];

const logState = wrappedState => {
   const state = wrappedState.present;
   const baseStateObj = R.reduce(
      (acc, key) => {
         acc[key] = state[key];
         return acc;
      },
      {},
      stateKeys
   );
   const cellReducersArr = R.map(
      cellKey => R.assoc(cellKey, state[cellKey], {})
   )(state.cellKeys)

   // note that the cellReducers are logged as being in an array called cellReducers, but in the store every cell reducer is stored at the top level
   const fullStateObj = R.mergeAll([baseStateObj, { cellReducers: cellReducersArr }]);
   console.log({ ...wrappedState, present: fullStateObj });
};

function mapStateToProps(state) {
   return {
      state: state,
      sheetId: state.sheetId,
   };
}

export default connect(mapStateToProps)(App);
