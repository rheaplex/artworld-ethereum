var ArtIs = artifacts.require("./ArtIs.sol");

contract('ArtIs', function(accounts) {
  it("Should initialise extent of definition #1 to 2", function () {
    return ArtIs.deployed().then(function (instance) {
      return instance.definitions.call(1);
    }).then (function (definition) {
      assert.equal(definition[1].toNumber(), 2)
    });
  });
  it("Should accept correctly specified changes of definition", function () {
    var artis;
    // 1000000000000000000 is the price for setting index 11
    return ArtIs.deployed().then(function (instance) {
      artis = instance;
      return artis.setDefinition(11, 9, 8, 7, 6,
                                 {from:accounts[1],
                                  value: 1000000000000000000});
    }).then (function () {
      return artis.definitions.call(11);
    }).then (function (definition) {
      assert.equal(definition[0].toString(), accounts[1]);
      assert.equal(definition[1].toNumber(), 9);
      assert.equal(definition[2].toNumber(), 8);
      assert.equal(definition[3].toNumber(), 7);
      assert.equal(definition[4].toNumber(), 6);
      var balance = web3.eth.getBalance(artis.address).toNumber();
      assert.equal(balance, 1000000000000000000);
    });
  });
  it("Should not drain value of contract when non-owner asks", function () {
    var artis;
    var owner_old_balance;
    // 500 is the price for setting index 3
    return ArtIs.deployed().then(function (instance) {
      artis = instance;
      return artis.drain({from: accounts[1]});
    }).catch(function(error) {
        assert.notEqual(error.toString().indexOf("invalid JUMP"), -1);
    });
  });
  it("Should drain value of account when owner asks", function () {
    var artis;
    var owner_old_balance;
    // 500 is the price for setting index 3
    return ArtIs.deployed().then(function (instance) {
      artis = instance;
      // Accounts[0] will be contract creator
      owner_old_balance = web3.eth.getBalance(accounts[0]).toNumber();
      return artis.drain();
    }).then (function (result) {
      var gasUsed = result.receipt.gasUsed * web3.eth.gasPrice.toNumber();
      var new_balance = web3.eth.getBalance(accounts[0]).toNumber();
      // Gas costs are hard. So just check that the balance is higher
      assert.isAbove(new_balance - gasUsed, owner_old_balance);
      var balance = web3.eth.getBalance(artis.address).toNumber();
      assert.equal(balance, 0);
    });
  });
  it("Should not accept definitions with bad values", function () {
    var artis;
    return ArtIs.deployed().then(function (instance) {
      return instance.setDefinition(3, 900, 1, 1, 1,
                                    {from:accounts[1],
                                     value: 500});
    }).catch(function(error) {
        assert.notEqual(error.toString().indexOf("invalid JUMP"), -1);
    });
  });
  it("Should not accept definitions with a bad index", function () {
    var artis;
    return ArtIs.deployed().then(function (instance) {
      return instance.setDefinition(100, 1, 1, 1, 1,
                                    {from:accounts[1],
                                     value: 500});
    }).catch(function(error) {
        assert.notEqual(error.toString().indexOf("invalid JUMP"), -1);
    });
  });
  it("Should not accept definitions with a bad value", function () {
    var artis;
    return ArtIs.deployed().then(function (instance) {
      return instance.setDefinition(3, 1, 1, 1, 1,
                                    {from:accounts[1],
                                     value: 5});
    }).catch(function(error) {
        assert.notEqual(error.toString().indexOf("invalid JUMP"), -1);
    });
  });
});
