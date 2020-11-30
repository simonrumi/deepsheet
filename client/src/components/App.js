import React from 'react';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Sheet from './Sheet';
import ModalBackground from './atoms/ModalBackground';
import Footer from './molecules/Footer';

// TODO: need to change whitelist of IP addresses for mongodb

const App = props => {
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
   'sheet',
   'sheets',
   'metadata',
   'editor',
   'editorRef',
   'title',
   'filterModal',
   'cellDbUpdates',
   'menu',
   'focus',
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
   console.log(fullStateObj);
   console.log('past:', wrappedState.past, 'future:', wrappedState.future);
};

function mapStateToProps(state) {
   return {
      state: state,
      sheetId: state.sheetId,
   };
}

export default connect(mapStateToProps)(App);
