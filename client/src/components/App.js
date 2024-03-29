import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { undid, redid } from '../actions/undoActions';
import { hideAllPopups } from '../actions';
import Sheet from './Sheet';
import ModalBackground from './atoms/ModalBackground';
import Footer from './molecules/Footer';
import { logState } from '../clientLogger';

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

function mapStateToProps(state) {
   return {
      state: state,
   };
}

export default connect(mapStateToProps)(App);
