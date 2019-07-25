const SecureLineProperties = artifacts.require("SecureLineProperties");

contract("SecureLineProperties", async accounts => {
  it("should set owner", async () => {
    const properties = await SecureLineProperties.deployed();
    assert.equal(await properties.owner(), accounts[0]);
  });

  it("should allow owner to set properties", async () => {
    const properties = await SecureLineProperties.deployed();
    await properties.setProperties(12, 1, 0x000A05);
    assert.equal((await properties.width()).toNumber(), 12);
    assert.equal((await properties.cap()).toNumber(), 1);
    assert.equal((await properties.dashes()).toNumber(), 0x000A05);
  });

  it("should not set invalid properties", async () => {
    const properties = await SecureLineProperties.deployed();
    await properties.setProperties(1, 100, 0x0);
    assert.equal((await properties.width()).toNumber(), 12);
    assert.equal((await properties.cap()).toNumber(), 1);
    assert.equal((await properties.dashes()).toNumber(), 0x000A05);
  });

  it("should not allow non-owner to set properties", async () => {
    const properties = await SecureLineProperties.deployed();
    await properties.setProperties(24, 2, 0x00060C, {from: accounts[1]});
    assert.equal((await properties.width()).toNumber(), 12);
    assert.equal((await properties.cap()).toNumber(), 1);
    assert.equal((await properties.dashes()).toNumber(), 0x000A05);
  });  
});
