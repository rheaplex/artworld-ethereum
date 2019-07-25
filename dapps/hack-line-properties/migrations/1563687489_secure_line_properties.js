const SecureLineProperties = artifacts.require('SecureLineProperties');

module.exports = async deployer => {
  await deployer.deploy(SecureLineProperties);
};
