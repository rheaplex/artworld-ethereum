
var LotterySymbol = artifacts.require("./LotterySymbol.sol");

module.exports = function(deployer, network) {
  deployer.deploy(LotterySymbol);
};
