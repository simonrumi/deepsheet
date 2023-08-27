import React from 'react';
import { GOOGLE_AUTH_URL } from '../../constants';

const loginWithGoogle = () => {
   window.location.href = GOOGLE_AUTH_URL;
};

const GoogleLoginBtn = ({ classes = '' }) => {
   const allClasses = 'cursor-pointer ' + classes;
   // return (
   //    <div className={allClasses} onClick={loginWithGoogle}>
   //       <img src="/img/btn_google_signin_dark_normal_web@2x.png" alt="login with Google" />
   //    </div>
   // );
	// this code came from using Google's code generator here
	// https://developers.google.com/identity/gsi/web/tools/configurator
	return(<>
		<div id="g_id_onload"
			data-client_id="761528077812-aiufet2eu5rloejs76hqffber30r31kp.apps.googleusercontent.com"
			data-context="signin"
			data-ux_mode="popup"
			data-login_uri="http://localhost:8888/.netlify/functions/authReturnGoogleSimple"
			data-auto_select="true"
			data-itp_support="true">
		</div>

		<div className="g_id_signin"
			data-type="standard"
			data-shape="rectangular"
			data-theme="outline"
			data-text="signin_with"
			data-size="large"
			data-logo_alignment="left">
		</div>
	</>);
};

// data-login_uri used to have  .netlify/functions/authReturnGoogle // TIDY comment

export default GoogleLoginBtn;
