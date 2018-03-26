const ProofOfWorkBitmap = artifacts.require("./ProofOfWorkBitmap.sol")

module.exports = function(deployer) {
  deployer.deploy(ProofOfWorkBitmap)
}
