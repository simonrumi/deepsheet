import React, { Component } from 'react';
import { connect } from 'react-redux';
import FacebookLoginButton from '../atoms/BtnFacebookLogin';
import GoogleLoginButton from '../atoms/BtnGoogleLogin';

class LoginModal extends Component {
   render() {
      if (!this.props.auth.isLoggedIn) {
         return (
            <div className="fixed z-20 top-0 mt-4 left-1/3 w-1/2 md:w-1/3 border border-solid border-grey-blue bg-white shadow-lg px-2 py-2">
               <div className="flex flex-col items-center">
                  <div className="mb-8 text-dark-dark-blue w-3/4">Let's get logged in so we can save our sheet...</div>
                  <FacebookLoginButton classes="w-3/4 pt-4" />
                  <GoogleLoginButton classes="w-3/4 pt-4" />
               </div>
            </div>
         );
      }
      return null;
   }
}

function mapStateToProps(state, ownProps) {
   return {
      auth: state.auth,
   };
}

export default connect(mapStateToProps, {})(LoginModal);
