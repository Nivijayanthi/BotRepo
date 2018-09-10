const config = require('./lib/config.js');
const graph = require('@microsoft/microsoft-graph-client');
const passport = require('passport');
const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;


//authentication---------------------------

var callback = (iss, sub, profile, accessToken, refreshToken, done) => {
  if (!profile.oid) {
    return done(new Error("No oid found"), null);
  }

  findByOid(profile.oid, function(err, user){
    if (err) {
      return done(err);
    }

    if (!user) {
      users.push({profile, accessToken, refreshToken});
      return done(null, profile);
    }

    return done(null, user);
  });
};

passport.use(new OIDCStrategy(config.creds, callback));

const users = [];

passport.serializeUser((user, done) => {
  done(null, user.oid);
});

passport.deserializeUser((id, done) => {
  findByOid(id, function (err, user) {
    done(err, user);
  });
});

var findByOid = function(oid, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.profile.oid === oid) {
      return fn(null, user);
    }
  }
  return fn(null, null);
};

//Configuration.............................................


//application....................................

function ensureAuthenticated (req, res, next) {
    if (req.isAuthenticated()) { return next(); }
};

function sendEmail(user, message, done){
    var client = graph.Client.init({
      defaultVersion: 'v1.0',
      debugLogging: true,
      authProvider: function(authDone) {
        authDone(null, user.accessToken);
      }
    });

    client.api('/me/sendmail').post(message,
      (err) => {
        return done(err);
      }
    );
  };


exports.sendEmail = sendEmail;



