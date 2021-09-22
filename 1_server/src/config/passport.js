const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

/*
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const AppleStrategy = require('passport-apple');
const path = require('path');
*/

const config = require('./config');
const { tokenTypes } = require('./tokens');
const { User } = require('../models');

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error('Invalid token type');
    }
    const user = await User.findById(payload.sub);
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

/*
const googleStrategyOptions = {
  clientID: '302957349711-djkd65scmbttrl3703eudbnnsp827jeh.apps.googleusercontent.com',
  clientSecret: '5_sP2_maMmzvNfKguTsqE93m',
  callbackURL: 'http://127.0.0.1:3000/v1/auth/google/callback',
};


const googleVerify = async (accessToken, refreshToken, profile, done) => {
  // se ja existir alguma conta com GMAIL no sistema,
  //
  console.log('profile: %O', profile);
  User.findOne({
    $or: [{ 'google.id': profile.id }, { email: profile.emails[0].value }],
  }).then((currentUser) => {
    console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    if (currentUser) {
      // already have this user
      console.log(profile.emails[0].value);
      // console.log('user is: ', email);
      done(null, currentUser);
    } else {
      // if not, create user in our db
      const newUser = new User();
      newUser.name = profile.displayName;
      newUser.firstName = profile.name.givenName;
      newUser.lastName = profile.name.familyName;
      newUser.email = profile.emails[0].value;
      newUser.google.id = profile.id;
      newUser.google.email = profile.emails[0].value;
      newUser.isEmailVerified = profile.emails[0].verified;
      newUser.isPasswordBlank = true;
      newUser.save(function (err) {
        if (err) throw err;

        return done(null, newUser);
      });
    }
  });
};

const googleStrategy = new GoogleStrategy(googleStrategyOptions, googleVerify);

const appleStrategyOptions = {
  clientID: 'APPLE_SERVICE_ID',
  callbackURL: 'https://www.example.net/auth/apple/callback',
  teamId: 'APPLE_TEAM_ID',
  keyIdentifier: 'RB1233456',
  privateKeyPath: path.join(__dirname, './AuthKey_RB1233456.p8'),
};

const appleVerify = async (req, accessToken, refreshToken, idToken, profile, done) => {
  // Here, check if the idToken exists in your database!

  const { id } = profile;
  User.findOrCreate({ googleId: profile.id }, function (err, user) {
    done(null, idToken);
  });
};

const appleStrategy = new AppleStrategy(appleStrategyOptions, appleVerify);
*/
module.exports = {
  jwtStrategy,
  /*
  googleStrategy,
  appleStrategy,
  */
};
