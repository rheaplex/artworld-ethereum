const SecretArtworks = artifacts.require("./SecretArtworks.sol")

module.exports = deployer =>
  deployer.deploy(SecretArtworks)
  .then(instance => {
    instance.createSecretArtwork(1, 'content', '0x1518e1270240a33b92f12e6f2a41b0c32820b5620d3a40034b99cd2b6e6d7556')
    return instance
  })
