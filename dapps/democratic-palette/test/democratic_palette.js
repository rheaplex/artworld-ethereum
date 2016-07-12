var checkColour = function (colour, r, g, b, votes) {
  assert.equal(web3.toDecimal(colour[0]),
               r,
               "incorrect red");
  assert.equal(web3.toDecimal(colour[1]),
               g,
               "incorrect green");
  assert.equal(web3.toDecimal(colour[2]),
               b,
               "incorrect blue");
  assert.equal(web3.toDecimal(colour[3]),
               votes,
               "incorrect vote");
};

var voteForAll = function (palette) {
  return palette.voteFor(1, 1, 1)
    .then(function () { return palette.voteFor(2, 1, 1); })
    .then(function () { return palette.voteFor(3, 1, 1); })
    .then(function () { return palette.voteFor(4, 1, 1); })
    .then(function () { return palette.voteFor(5, 1, 1); })
    .then(function () { return palette.voteFor(6, 1, 1); })
    .then(function () { return palette.voteFor(7, 1, 1); })
    .then(function () { return palette.voteFor(8, 1, 1); })
    .then(function () { return palette.voteFor(9, 1, 1); })
    .then(function () { return palette.voteFor(10, 1, 1); })
    .then(function () { return palette.voteFor(11, 1, 1); })
    .then(function () { return palette.voteFor(12, 1, 1); });
};

var vote5Times = function (palette, red) {
  return palette.voteFor(red, 1, 1)
    .then(function () { return palette.voteFor(red, 1, 1); })
    .then(function () { return palette.voteFor(red, 1, 1); })
    .then(function () { return palette.voteFor(red, 1, 1); })
    .then(function () { return palette.voteFor(red, 1, 1); });
};

contract('DemocraticPalette', function(accounts) {

  // This is a bit of a blob. Better promise composition would simplify it.

  it("should update votes properly", function(done) {
    var palette = DemocraticPalette.at(DemocraticPalette.deployed_address);
    voteForAll(palette).then(function () {
      return palette.palette(0);
    })
    // Initial state, everything should have one vote
      .then(function (colour) {
        checkColour(colour, 1, 1, 1, 1);
        return vote5Times(palette, 102);
      })
    // Vote on a couple of colours
      .then(function () {
        return vote5Times(palette, 203);
      })
      .then(function () {
        return vote5Times(palette, 12);
      })
    // Check that they have the correct votes
      .then(function () {
        return palette.palette(0);
      })
      .then(function (colour) {
        checkColour(colour, 102, 1, 1, 5);
        return palette.palette(1);
      })
      .then(function (colour) {
        checkColour(colour, 203, 1, 1, 5);
        return palette.palette(11);
      })
      .then(function (colour) {
        checkColour(colour, 12, 1, 1, 6);
      })
      .then(done).catch(done);
  });

});
