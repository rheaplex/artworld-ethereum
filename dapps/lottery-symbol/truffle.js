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
    "live": {
      network_id: 1, // Ethereum public network
      host: "localhost",
      port: 8545,
      from: "0x069a4c2d3dE4f09C31CA640418C13e6f476Bb281",
    },
    development: {
      host: "localhost",
      port: 8545,
      network_id: "default" // Match any network id
    }
  }
};
