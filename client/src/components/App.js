import React from 'react';
import { connect } from 'react-redux';

import Sheet from './Sheet';
import Footer from './molecules/Footer';

import { DEFAULT_SHEET_ID } from '../actions/types';

const App = props => {
   return (
      <div>
         <div className="min-h-screen pb-1">
            <Sheet sheetId={props.sheetId || DEFAULT_SHEET_ID} />
         </div>
         <div className="w-full h-1 object-none object-bottom absolute">
            <Footer />
         </div>
      </div>
   );
};

function mapStateToProps(state) {
   return {
      sheetId: state.sheetId,
   };
}

export default connect(mapStateToProps)(App);
