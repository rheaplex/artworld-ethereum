const SecretArtworks = artifacts.require("./SecretArtworks.sol")

module.exports = deployer =>
    deployer.then(() => {
	return SecretArtworks.deployed()
    }).then(instance => {
	return instance.createSecretArtwork(2, 'subject', '0x5d4e79c411b3f83261456847e503187b67208ef9a364005fcd3ef3ff3c06fcc2')
    })
