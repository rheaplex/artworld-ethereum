contract('HotCold', function(accounts) {

  it("should default to hot, cold", function(done) {
    var hot_cold = HotCold.deployed();

    hot_cold.hot().then(function(result) {
      assert.equal(web3.toAscii(result).replace(/\0+$/, ""),
                   "hot",
                   "initial hot value wasn't 'hot '");
      return hot_cold.cold.call();
    }).then(function (result) {
      assert.equal(web3.toAscii(result).replace(/\0+$/, ""),
                   "cold",
                   "initial cold value wasn't 'cold'");
    }).then(done).catch(done);
  });

  it("swapping should swap the values", function(done) {
    var hot_cold = HotCold.deployed();

    hot_cold.swap({ from: web3.eth.accounts[0] }).then(function() {
      return hot_cold.hot.call();
    }).then(function(result) {
      assert.equal(web3.toAscii(result).replace(/\0+$/, ""),
                   "cold",
                   "swapped hot value wasn't 'cold'");
    }).then(function () {
      return hot_cold.cold.call();
    }).then(function (result) {
      assert.equal(web3.toAscii(result).replace(/\0+$/, ""),
                   "hot",
                   "swapped cold value wasn't 'hot '");
    }).then(function () {
      return hot_cold.swap({ from: web3.eth.accounts[0] });
    }).then(function() {
      return hot_cold.hot.call();
    }).then(function(result) {
      assert.equal(web3.toAscii(result).replace(/\0+$/, ""),
                   "hot",
                   "swapped back hot value wasn't 'hot '");
      return hot_cold.cold.call();
    }).then(function (result) {
      assert.equal(web3.toAscii(result).replace(/\0+$/, ""),
                   "cold",
                   "swapped back cold value wasn't 'cold'");
    }).then(done).catch(done);
  });
});
