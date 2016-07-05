module.exports = {
  build: {
    "index.html": "index.html",
    "app.js": [
      "javascripts/jquery.min.js",
      "javascripts/bootstrap.min.js",
      "javascripts/Colour.js",
      "javascripts/ColourPicker.js",
      "javascripts/app.js"
    ],
    "app.css": [
      "stylesheets/bootstrap.min.css",
      "stylesheets/app.css"
    ],
    "images/": "images/"
  },
  deploy: [
    "BlankCanvas"
  ],
  rpc: {
    host: "localhost",
    port: 8545
  }
};
