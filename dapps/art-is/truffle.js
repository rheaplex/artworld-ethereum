var DefaultBuilder = require("truffle-default-builder");

module.exports = {
  build: new DefaultBuilder({
    "index.html": "index.html",
    "app.js": [
      "../../shared/js/jquery.js",
      "../../shared/js/tether.js",
      "../../shared/js/bootstrap.js",
      "../../shared/js/web3.js",
      "../../shared/js/shared.js",
      "app.js"
    ],
    "app.css": [
      "../../shared/css/bootstrap.css",
      "../../shared/css/shared.css",
      "app.css"
    ]
  }),
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    }
  }
};
