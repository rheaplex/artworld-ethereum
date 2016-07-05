contract('BlankCanvas', function(accounts) {
  it("should deploy the contract correctly", function(done) {
    var blank_canvas = BlankCanvas.at(BlankCanvas.deployed_address);
    blank_canvas.red.call()
      .then(function (r) {
        assert.equal(web3.toDecimal(r),
                     8,
                     "incorrect initial red");
        return blank_canvas.green();
      })
      .then(function (g) {
        assert.equal(web3.toDecimal(g),
                     32,
                     "incorrect initial green");
        return blank_canvas.blue();
      })
      .then(function (b) {
        assert.equal(web3.toDecimal(b),
                     255,
                     "incorrect initial blue");
      })
      .then(done).catch(done);
  });


  it("should get the current rgb correctly", function(done) {
    var blank_canvas = BlankCanvas.at(BlankCanvas.deployed_address);
    blank_canvas.getColour.call()
      .then(function (rgb) {
        assert.equal(web3.toDecimal(rgb[0]),
                     8,
                     "incorrect get red");
        assert.equal(web3.toDecimal(rgb[1]),
                     32,
                     "incorrect get green");
        assert.equal(web3.toDecimal(rgb[2]),
                     255,
                     "incorrect get blue");
      })
      .then(done).catch(done);
  });

    it("should set the rgb correctly", function(done) {
    var blank_canvas = BlankCanvas.at(BlankCanvas.deployed_address);
    blank_canvas.setColour(4, 96, 128, { from: web3.eth.accounts[0] })
      .then(function () {
        return blank_canvas.red();
      })
      .then(function (r) {
        assert.equal(web3.toDecimal(r),
                     4,
                     "incorrect set red");
        return blank_canvas.green();
      })
      .then(function (g) {
        assert.equal(web3.toDecimal(g),
                     96,
                     "incorrect set green");
        return blank_canvas.blue();
      })
      .then(function (b) {
        assert.equal(web3.toDecimal(b),
                     128,
                     "incorrect set blue");
      })
      .then(done).catch(done);
  });
});
