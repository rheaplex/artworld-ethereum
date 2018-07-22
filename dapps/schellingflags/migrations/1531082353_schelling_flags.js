const NUM_FLAG_LAYOUTS = 20;
const NUM_FLAG_OVERLAYS = 20;

const SchellingFlags = artifacts.require("./SchellingFlags.sol")

module.exports = deployer =>
  deployer.deploy(SchellingFlags)
  .then(instance => {
    instance.setNumLayoutDesigns(NUM_FLAG_LAYOUTS)
    return instance
  })
  .then(instance => {
    instance.setNumOverlayDesigns(NUM_FLAG_OVERLAYS)
  })
