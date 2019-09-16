/* globals artifacts */

const StakingRatio = artifacts.require('./StakingRatio.sol');

module.exports = async (deployer) => {
  await deployer.deploy(StakingRatio);
};
