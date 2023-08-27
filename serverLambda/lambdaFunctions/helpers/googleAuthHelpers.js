import { google } from 'googleapis';
import axios from 'axios';
import keys from '../../config/keys';

// TODO NEXT need to verify the app ....the scopes could be a problem as they are changed
// see https://blog.timekit.io/google-oauth-invalid-grant-nightmare-and-how-to-fix-it-9f4efaf1da35#.eqa5iwbkt

export const makeGoogleAuthCall = state => {
   const { googleClientID, googleClientSecret, googleAuthReturnURI } = keys;
   const oauth2Client = new google.auth.OAuth2(googleClientID, googleClientSecret, googleAuthReturnURI);
   const redirectUrl = oauth2Client.generateAuthUrl({
      access_type: 'online',
      scope: ['openid', 'https://www.googleapis.com/auth/userinfo.profile'], // if more than one scope, pass an array of strings // was just 'profile' ...looks like this has changed - 8/24/23 TIDY comment
      state,
   });
   // status code 302 is what passport uses. From MDN:
   // "The HyperText Transfer Protocol (HTTP) 302 Found redirect status response code indicates
   // that the resource requested has been temporarily moved to the URL given by the Location header.
   // ...It is therefore recommended to set the 302 code only as a response for GET or HEAD methods"
   return { statusCode: 302, redirectUrl }
}

export const getTokenFromGoogle = async (oauth2Client, code) => {
	console.log('googleAuthHelpers--getTokenFromGoogle started with code', code);
   const { tokens } = await oauth2Client.getToken(code); // TODO BUG HERE - getting "GaxiosError: invalid_grant"
	console.log('googleAuthHelpers--getTokenFromGoogle got tokens', tokens, 'about to call oauth2Client.setCredentials(tokens)');
   oauth2Client.setCredentials(tokens); // per the example here https://developers.google.com/people/quickstart/nodejs and here https://github.com/googleapis/google-api-nodejs-client#authentication-and-authorization
   return tokens.access_token;
}

export const getGoogleUserId = async accessToken => {
   const googleUserData = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`);
   return googleUserData?.data?.id;
}

// references:
// https://developers.google.com/people/quickstart/nodejs
// https://github.com/googleapis/google-api-nodejs-client#oauth2-client
// https://developers.google.com/identity/protocols/oauth2/web-server#php
// info about scopes here https://developers.google.com/identity/protocols/oauth2/scopes#oslogin