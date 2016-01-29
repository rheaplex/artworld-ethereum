contract('IsArt', function(accounts) {

  it("should default to 'is not'", function(done) {
    var is_art = IsArt.deployed();

    is_art.is_art.call().then(function(result) {
      assert.equal(web3.toAscii(result).replace(/\0+$/, ""),
                   "is not",
                   "initial value wasn't 'is not'");
    }).then(done).catch(done);
  });

  it("toggling should toggle the value", function(done) {
    var is_art = IsArt.deployed();

    is_art.toggle({ from: web3.eth.accounts[0] }).then(function() {
      return is_art.is_art.call();
    }).then(function(result) {
      assert.equal(web3.toAscii(result).replace(/\0+$/, ""),
                   "is",
                   "toggled value wasn't 'is'");
    }).then(function () {
      return is_art.toggle({ from: web3.eth.accounts[0] });
    }).then(function() {
      return is_art.is_art.call();
    }).then(function(result) {
      assert.equal(web3.toAscii(result).replace(/\0+$/, ""),
                   "is not",
                   "toggled back value wasn't 'is not'");
    }).then(done).catch(done);
  });
});
