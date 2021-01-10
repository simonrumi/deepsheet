const { google } = require('googleapis');
const axios = require('axios');
const keys = require('../../config/keys');

const makeGoogleAuthCall = state => {
   const { googleClientID, googleClientSecret, googleAuthReturnURI } = keys;
   const oauth2Client = new google.auth.OAuth2(googleClientID, googleClientSecret, googleAuthReturnURI);
   const endpoint = oauth2Client.generateAuthUrl({
      access_type: 'online',
      scope: [ 'profile' ],
      state,
   });
   // status code 302 is what passport uses. From MDN:
   // "The HyperText Transfer Protocol (HTTP) 302 Found redirect status response code indicates
   // that the resource requested has been temporarily moved to the URL given by the Location header.
   // ...It is therefore recommended to set the 302 code only as a response for GET or HEAD methods"
   return {
      statusCode: 302,
      headers: {
         Location: endpoint,
         'Access-Control-Allow-Headers': '*',
         'Access-Control-Allow-Origin': '*', 
         'Access-Control-Allow-Methods': '*', // 'OPTIONS, POST, GET',
      },
      // not having a body causes a warning to be thrown, saying we should have a body,
      // but we're redirecting, so we have no use for a body...and in fact the redirect breaks if we do
   };
}

const getTokenFromGoogle = async (oauth2Client, code) => {
   const { tokens } = await oauth2Client.getToken(code);
   oauth2Client.setCredentials(tokens); // maybe unnecessary, but is per the example here https://developers.google.com/people/quickstart/nodejs
   return tokens.access_token;
}

const getGoogleUserId = async accessToken => {
   const googleUserData = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`);
   return googleUserData?.data?.id;
}
 
module.exports = {
   makeGoogleAuthCall,
   getTokenFromGoogle,
   getGoogleUserId,
};

// references:
// https://developers.google.com/people/quickstart/nodejs
// https://github.com/googleapis/google-api-nodejs-client#oauth2-client
// https://developers.google.com/identity/protocols/oauth2/web-server#php
// info about scopes here https://developers.google.com/identity/protocols/oauth2/scopes#oslogin