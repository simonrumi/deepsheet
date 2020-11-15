import React, { Component } from 'react';
import { connect } from 'react-redux';
import { GoogleLogin /* GoogleLogout */ } from 'react-google-login';
import axios from 'axios';
import { loggedIn, loggedOut } from '../../actions/authActions';
import { triggeredFetchSheet } from '../../actions/sheetActions';
import { GOOGLE_AUTH_URL, GOOGLE_CLIENT_ID } from '../../constants';

class GoogleLoginBtn extends Component {
   constructor(props) {
      super(props);
      this.googleLogin = this.googleLogin.bind(this);
      this.handleGoogleLoginFailure = this.handleGoogleLoginFailure.bind(this);
      this.googleLogout = this.googleLogout.bind(this);
      this.handleGoogleLogoutFailure = this.handleGoogleLogoutFailure.bind(this);
   }

   async googleLogin(response) {
      if (response.accessToken) {
         const googleIdToken = response.tokenObj.id_token;
         try {
            const googleResponse = await axios.post(GOOGLE_AUTH_URL, { googleIdToken });
            const ddsCookie = decodeURIComponent(googleResponse.data.cookie);
            document.cookie = ddsCookie;
         } catch (err) {
            console.error('error trying to get auth confirmation from backend', err);
            loggedOut(err);
         }
         loggedIn();
         try {
            await triggeredFetchSheet();
         } catch (err) {
            console.error('error trying to create sheet', err);
         }
      }
   }

   googleLogout(response) {
      // this.setState(state => ({
      //   isLogined: false,
      //   accessToken: ''
      // }));
      console.log('logged out');
   }

   handleGoogleLoginFailure(response) {
      console.log('Failed to log in...response:', response);
   }

   handleGoogleLogoutFailure(response) {
      console.log('Failed to log out');
   }

   render() {
      const allClasses = 'cursor-pointer ' + this.props.classes;
      return (
         <div className={allClasses}>
            <GoogleLogin
               clientId={GOOGLE_CLIENT_ID}
               buttonText="Login with Google"
               onSuccess={this.googleLogin}
               onFailure={this.handleGoogleLoginFailure}
               cookiePolicy={'single_host_origin'}
               responseType="code,token"
               theme="dark"
               className="w-full"
            />
         </div>
      );
   }
}

function mapStateToProps(state, ownProps) {
   return {
      state: state,
      classes: ownProps.classes,
   };
}

export default connect(mapStateToProps, {})(GoogleLoginBtn);
