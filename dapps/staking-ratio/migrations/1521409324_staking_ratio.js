/* globals artifacts */

const StakingRatio = artifacts.require('./StakingRatio.sol')

module.exports = function(deployer) {
  deployer.deploy(StakingRatio)
}
