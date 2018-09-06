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
  
 //var redirectUri = 'https://portal.azure.com';
 // var redirectUri = window.location.href;
  var redirectUri = "https://login.live.com/oauth20_desktop.srf";
  
  // The scopes the app requires
  var scopes = [ 'openid',
                    'offline_access',
                    'User.Read',
                    'Mail.Read',
                    'Calendars.readwrite',
                    'Contacts.Read' ];
  
  function getAuthUrl() {
    var returnVal = oauth2.authorizationCode.authorizeURL({
      redirect_uri: redirectUri,
      scope: scopes.join(' ')
    });
    console.log('Generated auth url: ' + returnVal);
    return returnVal;
  }

  function getTokenFromCode(auth_code, callback, response) {
    var token;
    oauth2.authorizationCode.getToken({
      code: auth_code,
      redirect_uri: redirectUri,
      scope: scopes.join(' ')
    }, function (error, result) {
      if (error) {
        console.log('Access token error: ', error.message);
        callback(response, error, null);
      } else {
        token = oauth2.accessToken.create(result);
        console.log('Token created: ', token.token);
        callback(response, null, token);
      }
    });
  }
  
  function refreshAccessToken(refreshToken, callback) {
    var tokenObj = oauth2.accessToken.create({refresh_token: refreshToken});
    tokenObj.refresh(callback);
  }
  

  exports.refreshAccessToken = refreshAccessToken;
  exports.getTokenFromCode = getTokenFromCode;
  exports.getAuthUrl = getAuthUrl;