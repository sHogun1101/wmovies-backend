require("dotenv").config();
const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const FacebookStrategy = require("passport-facebook").Strategy;
const configs = require("./configs/connection");
const passport = require("passport");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const axios = require("axios");
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async function (accessToken, refreshToken, profile, cb) {
      if (profile?.id) {
        try {
          const tokenLogin = uuidv4();
          profile.token_login = tokenLogin;
          const body = {
            query: `
                query MyQuery {
                  users(where:{google_id: {_eq:"${profile.id}"}, is_delete: {_eq: false }})
                  {
                    id
                  }
                }
                  `,
            variables: {},
          };
          const resQuery = await axios.post(
            configs.graphql_endpoint,
            body,
            configs.graphql_options
          );
          if (resQuery?.data?.data?.users?.length > 0) {
            // Tài khoản tồn tại update token
            const body = {
              query: `
                  mutation MyMutation {
                    update_users(where:{ google_id: {_eq:"${profile.id}"}},
                    _set: {
                        token_login: "${tokenLogin}"
                    }){
                      affected_rows
                    }
                  }
                              `,
              variables: {},
            };
            const resUpdateToken = await axios.post(
              configs.graphql_endpoint,
              body,
              configs.graphql_options
            );
          } else {
            // Không tồn tại thì thêm mới
            const saltRounds = 10;
            const salt = bcrypt.genSaltSync(saltRounds);

            const object = {};
            object.google_id = profile.id;
            object.username = profile.displayName;
            object.type_login = profile.provider;
            object.password = bcrypt.hashSync("movie123", salt);
            object.email = profile.emails[0]?.value;
            object.image_user = profile.photos[0]?.value;
            object.token_login = tokenLogin;
            const body = {
              query: `
              mutation MyMutation($objects: [users_insert_input!]!) {
                insert_users(objects: $objects
                  on_conflict: {
                    constraint: users_email_key 
                    update_columns: [
                      token_login
                      image_user
                    ]
                }){
                  returning {
                    id
                  }
                }
              }
                    `,
              variables: { objects: object },
            };
            const resInsert = await axios.post(
              configs.graphql_endpoint,
              body,
              configs.graphql_options
            );
          }
        } catch (error) {
          console.log(error);
        }
      }

      return cb(null, profile);
    }
  )
);
// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: process.env.FACEBOOK_APP_ID,
//       clientSecret: process.env.FACEBOOK_APP_SECRET,
//       callbackURL: "/api/auth/facebook/callback",
//       profileFields: ["email", "photos", "id", "displayName"],
//     },
//     async function (accessToken, refreshToken, profile, cb) {
//       const tokenLogin = uuidv4();
//       profile.tokenLogin = tokenLogin;
//       try {
//         if (profile?.id) {
//           let response = await db.User.findOrCreate({
//             where: { id: profile.id },
//             defaults: {
//               id: profile.id,
//               email: profile.emails[0]?.value,
//               typeLogin: profile?.provider,
//               name: profile?.displayName,
//               avatarUrl: profile?.photos[0]?.value,
//               tokenLogin,
//             },
//           });
//           if (!response[1]) {
//             await db.User.update(
//               {
//                 tokenLogin,
//               },
//               {
//                 where: { id: profile.id },
//               }
//             );
//           }
//         }
//       } catch (error) {
//         console.log(error);
//       }
//       // console.log(profile);
//       return cb(null, profile);
//     }
//   )
// );
