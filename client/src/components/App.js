import React from 'react';
import { connect } from 'react-redux';
import * as R from 'ramda';

import Sheet from './Sheet';
import ModalBackground from './atoms/ModalBackground';
import Footer from './molecules/Footer';

import { DEFAULT_SHEET_ID } from '../constants';

// import Temp from './Temp';

const App = props => {
   logState(props.state);
   return (
      <div>
         <ModalBackground />
         <div className="min-h-screen pb-1">
            <Sheet sheetId={props.sheetId || DEFAULT_SHEET_ID} />
            {/*
               <Temp sheetId={props.sheetId || DEFAULT_SHEET_ID} />
            */}
         </div>
         <div className="w-full h-1 object-none object-bottom absolute">
            <Footer />
         </div>
      </div>
   );
};

const logState = state => {
   if (R.keys(state.cellKeys).length === 0) {
      return;
   }
   const stateKeys = [
      'sheetId',
      'sheet',
      'editor',
      'editorRef',
      'title',
      'form',
      'filterModal',
      'cellKeys',
   ];

   const baseStateObj = R.reduce(
      (acc, key) => {
         acc[key] = state[key];
         return acc;
      },
      {},
      stateKeys
   );
   const cellsObj = R.reduce(
      (acc, key) => {
         acc[key] = state[key];
         return acc;
      },
      {},
      state.cellKeys
   );
   const fullStateObj = { ...baseStateObj, ...cellsObj };
   console.log(fullStateObj);
};

function mapStateToProps(state) {
   return {
      state: state,
      sheetId: state.sheetId,
   };
}

export default connect(mapStateToProps)(App);
