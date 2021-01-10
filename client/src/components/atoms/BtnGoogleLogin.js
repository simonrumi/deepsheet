import React from 'react';
import { GOOGLE_AUTH_URL } from '../../constants';

const loginWithGoogle = () => {
   window.location.href = GOOGLE_AUTH_URL;
};

const GoogleLoginBtn = ({ classes = '' }) => {
   const allClasses = 'cursor-pointer ' + classes;
   return (
      <div className={allClasses} onClick={loginWithGoogle}>
         <img src="/img/btn_google_signin_dark_normal_web@2x.png" alt="login with Facebook" />
      </div>
   );
};

export default GoogleLoginBtn;
