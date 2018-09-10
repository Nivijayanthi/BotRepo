const graph = require('@microsoft/microsoft-graph-client');
require('dotenv').config();

         var credentials = {
            client: {
              id: '8a6b25b5-7148-45ac-a716-98faf826d2fe',
              secret: 'dqvntQRX930|=%msRYKD10(',
            },
            auth: {
              tokenHost: 'https://login.microsoftonline.com',
              authorizePath: 'common/oauth2/v2.0/authorize',
              tokenPath: 'common/oauth2/v2.0/token'
            }
          };
          var oauth2 = require('simple-oauth2').create(credentials);

 function getUserEmail(user, done) {
    var client = graph.Client.init({
      defaultVersion: 'v1.0',
      debugLogging: true,
      authProvider: function(authDone) {
        authDone(null, user.accessToken);
      }
    });
    console.log(`Generated auth url: ${returnVal}`);
    return returnVal;
}
async function getAccessToken(cookies, res) {
    // Do we have an access token cached?
    let token = cookies.graph_access_token;

    if (token) {
        // We have a token, but is it expired?
        // Expire 5 minutes early to account for clock differences
        const FIVE_MINUTES = 300000;
        const expiration = new Date(parseFloat(cookies.graph_token_expires - FIVE_MINUTES));
        if (expiration > new Date()) {
            // Token is still good, just return it
            return token;
        }
    }

    // Either no token or it's expired, do we have a
    // refresh token?
    const refresh_token = cookies.graph_refresh_token;
    if (refresh_token) {
        const newToken = await oauth2.accessToken.create({
            refresh_token: refresh_token
        }).refresh();
        saveValuesToCookie(newToken, res);
        return newToken.token.access_token;
    }

    // Nothing in the cookies that helps, return empty
    return null;
}
async function getTokenFromCode(auth_code) {
    let result = await oauth2.authorizationCode.getToken({
        code: auth_code,
        redirect_uri: process.env.REDIRECT_URI,
        scope: process.env.APP_SCOPES
    });

    const token = oauth2.accessToken.create(result);
    console.log('Token created: ', token.token);
    return token.token.access_token;
}

exports.getTokenFromCode = getTokenFromCode;
exports.getAccessToken = getAccessToken;
