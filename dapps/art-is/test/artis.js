const ArtIs = artifacts.require("./ArtIs.sol");

contract('ArtIs', (accounts) => {
  it("should initialise extent of definition #1 to 2", () => {
    return ArtIs.deployed().then(instance => {
      return instance.definitions.call(1);
    }).then (definition => {
      assert.equal(definition[1].toNumber(), 2)
    });
  });
  it("should accept correctly specified changes of definition", () => {
    let artis;
    // 1000000000000000000 is the price for setting index 11
    return ArtIs.deployed().then(instance => {
      artis = instance;
      return artis.setDefinition(11, 9, 8, 7, 6,
                                 {from: accounts[1],
                                  value: 1000000000000000000});
    }).then (() => {
      return artis.definitions.call(11);
    }).then (definition => {
      assert.equal(definition[0].toString(), accounts[1]);
      assert.equal(definition[1].toNumber(), 9);
      assert.equal(definition[2].toNumber(), 8);
      assert.equal(definition[3].toNumber(), 7);
      assert.equal(definition[4].toNumber(), 6);
      const balance = web3.eth.getBalance(artis.address).toNumber();
      assert.equal(balance, 1000000000000000000);
    });
  });
  it("should not drain value of contract when non-owner asks", () => {
    let artis;
    let owner_old_balance;
    // 500 is the price for setting index 3
    return ArtIs.deployed().then(instance => {
      artis = instance;
      return artis.drain({from: accounts[1]});
    }).catch(function(error) {
        assert.notEqual(error.toString().indexOf("invalid JUMP"), -1);
    });
  });
  it("should drain value of account when owner asks", () => {
    let artis;
    let owner_old_balance;
    // 500 is the price for setting index 3
    return ArtIs.deployed().then(instance => {
      artis = instance;
      // Accounts[0] will be contract creator
      owner_old_balance = web3.eth.getBalance(accounts[0]).toNumber();
      return artis.drain();
    }).then (result => {
      const gasUsed = result.receipt.gasUsed * web3.eth.gasPrice.toNumber();
      const new_balance = web3.eth.getBalance(accounts[0]).toNumber();
      // Gas costs are hard. So just check that the balance is higher
      assert.isAbove(new_balance - gasUsed, owner_old_balance);
      const balance = web3.eth.getBalance(artis.address).toNumber();
      assert.equal(balance, 0);
    });
  });
  it("should not accept definitions with bad values", () => {
    let artis;
    return ArtIs.deployed().then(instance => {
      return instance.setDefinition(3, 900, 1, 1, 1,
                                    {from: accounts[1],
                                     value: 500});
    }).catch(error => {
        assert.notEqual(error.toString().indexOf("invalid JUMP"), -1);
    });
  });
  it("should not accept definitions with a bad index", () => {
    let artis;
    return ArtIs.deployed().then(instance => {
      return instance.setDefinition(100, 1, 1, 1, 1,
                                    {from: accounts[1],
                                     value: 500});
    }).catch(error => {
        assert.notEqual(error.toString().indexOf("invalid JUMP"), -1);
    });
  });
  it("should not accept definitions with a bad value", () => {
    let artis;
    return ArtIs.deployed().then(instance => {
      return instance.setDefinition(3, 1, 1, 1, 1,
                                    {from: accounts[1],
                                     value: 5});
    }).catch(error => {
        assert.notEqual(error.toString().indexOf("invalid JUMP"), -1);
    });
  });
  it("should not allow non-owner to transfer ownership", () => {
    let artis;
    return ArtIs.deployed().then(instance => {
      return instance.transferOwnership(accounts[1], {from: accounts[1]});
    }).then(() => {
      return ArtIs.drain({from: accounts[1]});
    }).catch(error => {
        assert.equal(error.toString().indexOf("invalid JUMP"), -1);
    });
  });
  it("should allow the owner to transfer ownership", () => {
    let artis;
    return ArtIs.deployed().then(instance => {
      return instance.transferOwnership(accounts[1], {from: accounts[0]});
    }).then(() => {
      return ArtIs.drain({from: accounts[1]});
    }).catch(error => {
      assert.notEqual(error.toString().indexOf("invalid JUMP"), -1);
    });
  });
});
