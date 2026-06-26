// import passport from "passport";
// import { Strategy as OpenIDConnectStrategy } from "passport-openidconnect";

// passport.use(
//   "oidc",

//   new OpenIDConnectStrategy(
//     {
//       issuer: process.env.OIDC_ISSUER,

//       authorizationURL:
//         process.env.OIDC_AUTHORIZATION_URL,

//       tokenURL:
//         process.env.OIDC_TOKEN_URL,

//       userInfoURL:
//         process.env.OIDC_USERINFO_URL,

//       clientID:
//         process.env.OIDC_USERINFO_URL,

//       clientSecret:
//         process.env.OIDC_CLIENT_SECRET,

//       callbackURL:
//         process.env.OIDC_CALLBACK_URL
//     },

//     async (
//       issuer,
//       profile,
//       done
//     ) => {
//       try {
//         return done(null, profile);
//       } catch (err) {
//         return done(err);
//       }
//     }
//   )
// );

// export default passport;