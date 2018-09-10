require('dotenv').config();
const credentials = {
    client: {
        id: process.env.APP_ID,
        secret: process.env.APP_PASSWORD,
    },
    auth: {
        tokenHost: 'https://login.microsoftonline.com',
        authorizePath: 'common/oauth2/v2.0/authorize',
        tokenPath: 'common/oauth2/v2.0/token'
    }
};
const oauth2 = require('simple-oauth2').create(credentials);
function getAuthUrl() {
    const returnVal = oauth2.authorizationCode.authorizeURL({
        redirect_uri: process.env.REDIRECT_URI,
        scope: process.env.APP_SCOPES
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
exports.getAuthUrl = getAuthUrl;