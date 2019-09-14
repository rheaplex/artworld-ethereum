/* global artifacts module */

const PayPreviousPath = artifacts.require('./PayPreviousPath.sol');

module.exports = function(deployer) {
  deployer.deploy(PayPreviousPath);
};
