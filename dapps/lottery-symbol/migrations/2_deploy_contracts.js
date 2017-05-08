var LotterySymbol = artifacts.require("./LotterySymbol.sol");

module.exports = function(deployer, network) {
  console.log(network);
  var roundLength =  5 * 60 * 24 * 7;
  // development is used in tests
  if (network == 'development') {
    roundLength = 1;
  }

  deployer.deploy(LotterySymbol, roundLength);
};
