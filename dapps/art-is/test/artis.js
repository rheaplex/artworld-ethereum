var BigNumber = require('bignumber.js');

contract('ArtIs', function(accounts) {

  it("contract creation should initialise descriptions'", function (done) {
    var art_is = ArtIs.deployed();

    art_is.definitions.call(0).then(function (result) {
      assert.equal(result[4].toString(), web3.eth.coinbase,
                   "creating account incorrect");
    }).then(done).catch(done);
  });

  it("setDefinition should update descriptions'", function (done) {
    var art_is = ArtIs.deployed();

    var set_account = web3.eth.accounts[2];
    var definition_to_set = 1;
    var definition_price = web3.toWei(1, "szabo");
    var balance_0 = web3.eth.getBalance(web3.eth.coinbase);
    var refund = new BigNumber(definition_price);

    art_is.setDefinition.sendTransaction(definition_to_set, 1, 2, 3, 4,
                                         {'value': definition_price,
                                          'from': set_account
                                         }).then(function () {
      return art_is.definitions.call(definition_to_set);
    }).then(function (result) {
      // Did the setter get changed?
      assert.equal(result[4].toString(), set_account,
                   "setter account incorrect - probably sent bad args/value");

      // Make sure the fee was refunded/forwarded to the previous setter
      var new_balance_0 = web3.eth.getBalance(web3.eth.coinbase);
      assert.equal(new_balance_0.equals(balance_0.plus(refund)),
                  true,
                  "setting definition didn't refund fee to previous setter");

      // Make sure the definition was set correctly
      assert.equal(result[0].toNumber(), 1,
                   "extent isn't 1");
      assert.equal(result[1].toNumber(), 2,
                   "connection isn't 2");
      assert.equal(result[2].toNumber(), 3,
                   "relation isn't 3");
      assert.equal(result[3].toNumber(), 4,
                   "subject isn't 4");
    }).then(done).catch(done);
  });

  it("setDefinition should fail if fee is wrong", function (done) {
    var art_is = ArtIs.deployed();

    var set_account = web3.eth.accounts[3];

    art_is.setDefinition.sendTransaction(3, 1, 1, 1, 1,
                                         {'value': 3,
                                          'from': set_account
                                         }).then(function () {
      return art_is.definitions.call(1);
    }).then(function (result) {
      // Did the setter get changed?
      assert.notEqual(result[4].toString(), set_account,
                       "setting should not have succeeded with wrong fee");
    }).then(done).catch(done);
  });

  it("setDefinition should fail if index out of range", function (done) {
    var art_is = ArtIs.deployed();

    var set_account = web3.eth.accounts[3];

    art_is.setDefinition.sendTransaction(128, 1, 1, 1, 1,
                                         {'value': 1,
                                          'from': set_account
                                         }).then(function () {
      return art_is.definitions.call(1);
    }).then(function (result) {
      // Did the setter get changed?
      assert.notEqual(result[4].toString(), set_account,
                      "setting should not have succeeded with wrong fee");
    }).then(done).catch(done);
  });

  it("setDefinition should fail for bad definition values", function (done) {
       var art_is = ArtIs.deployed();

       var set_account = web3.eth.accounts[3];

       art_is.setDefinition.sendTransaction(0, 1, 127, 1, 1,
                                            {'value': 1,
                                             'from': set_account
                                            }).then(function () {
         return art_is.definitions.call(1);
       }).then(function (result) {
         // Did the setter get changed?
         assert.notEqual(result[4].toString(), set_account,
                         "setting should not have succeeded with wrong fee");
       }).then(done).catch(done);
     });

});
