require("dotenv").config();
var ConnectionConfig = {
  graphql_endpoint: process.env.HASURA_ENDPOINT,
  graphql_options: {
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.HASURA_SECRET,
    },
  },
};
module.exports = ConnectionConfig;
