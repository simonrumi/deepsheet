import React from 'react';
import { FACEBOOK_AUTH_URL } from '../../constants';

const loginWithFacebook = () => {
   window.location.href = FACEBOOK_AUTH_URL;
};

const FacebookLoginBtn = ({ classes = '' }) => {
   const allClasses = 'cursor-pointer ' + classes;
   return (
      <div className={allClasses} onClick={loginWithFacebook}>
         <img src="/img/facebookLoginBtn.png" alt="login with Facebook" />
      </div>
   );
};

export default FacebookLoginBtn;
