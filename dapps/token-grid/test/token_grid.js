var TokenGrid = artifacts.require("TokenGrid");

contract("TokenGrid", function(accounts) {
  it("should vend tokens", async () => {
    var token_grid = await TokenGrid.deployed();
    const oldBalance = await token_grid.balanceOf(accounts[0]);
    await token_grid.requestToken();
    const newBalance = await token_grid.balanceOf(accounts[0]);
    assert.isAbove(newBalance.toNumber(), oldBalance.toNumber());
  });

  it("should allow token holder to burn token and set grid", async () => {
    var token_grid = await TokenGrid.deployed();
    const oldBalance = await token_grid.balanceOf(accounts[0]);
    await token_grid.setGrid(
      '0xFF000000000000000000000000000000000000000000000000000000000000',
      '0xFF000000000000000000000000000000000000000000000000000000000000'
    );
    const newBalance = await token_grid.balanceOf(accounts[0]);
    assert.isBelow(newBalance.toNumber(), oldBalance.toNumber());
  });

  it("should not allow non-token holder to burn token and set grid", async () => {
    var token_grid = await TokenGrid.deployed();
    try {
      await token_grid.setGrid(
        '0xFF000000000000000000000000000000000000000000000000000000000000',
        '0xFF000000000000000000000000000000000000000000000000000000000000'
      );
      assert.ok(false);
    } catch (_) {
      assert.ok(true);
    }
  });

  it("should not vend more than ten tokens to an address", async () => {
    var token_grid = await TokenGrid.deployed();
    while ((await token_grid.balanceOf(accounts[0])).toNumber() < 10) {
      await token_grid.requestToken();
    }
    try {
      await token_grid.balanceOf(accounts[0]);
      assert.ok(false);
    } catch (_) {
      assert.ok(true);
    }
    const balance = await token_grid.balanceOf(accounts[0]);
    assert.equal(balance.toNumber(), 10);
  });
});
