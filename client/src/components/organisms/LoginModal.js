import React, { Component } from 'react';
import { connect } from 'react-redux';
import { stateIsLoggedIn, stateAuthError } from '../../helpers/dataStructureHelpers';
import { loginModalText } from '../displayText';

import FacebookLoginButton from '../atoms/BtnFacebookLogin';
import GoogleLoginButton from '../atoms/BtnGoogleLogin';

class LoginModal extends Component {
   render() {
      if (!stateIsLoggedIn(this.props.state)) {
         return (
            <div className="fixed z-50 top-0 mt-4 left-1/3 w-1/2 md:w-1/3 border border-solid border-grey-blue bg-white shadow-lg px-2 py-2">
               <div className="flex flex-col items-center">
                  <div className="mt-8 mb-4 text-center text-dark-dark-blue font-semibold w-3/4">{loginModalText()}</div>
                  <GoogleLoginButton classes="flex justify-center w-3/4 pt-4" />
                  <FacebookLoginButton classes="w-3/4 pt-4" />
                  <div className="my-4 text-center text-burnt-orange w-3/4 italic">{stateAuthError(this.props.state)}</div>
               </div>
            </div>
         );
      }
      return null;
   }
}

function mapStateToProps(state, ownProps) {
   return {
      state: state,
   };
}

export default connect(mapStateToProps, {})(LoginModal);
