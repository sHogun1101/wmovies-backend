const axios = require("axios");
const configs = require("../configs/connection");
var GraphqlServices = {
  send: async function (body) {
    return new Promise((resolve) => {
      axios
        .post(configs.graphql_endpoint, body, configs.graphql_options)
        .then((response) => {
          resolve(response);
        });
    });
  },
};

module.exports = GraphqlServices;
