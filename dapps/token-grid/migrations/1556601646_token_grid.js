const TokenGrid = artifacts.require("./TokenGrid.sol");

module.exports = function(deployer) {
  deployer.deploy(TokenGrid);
};
