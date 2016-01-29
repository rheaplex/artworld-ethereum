var contract = "0xa49c4208ffb4d25ce75e0169066419b45e685331";
var image_base = 1000;
var image_chunks = 15;

var fetch = function() {
  var artwork = "";
  var location = image_base;
  for(var i = 0; i < image_chunks; i++) {
    artwork += eth.stateAt(contract,
                           "0x" + (location).toString(16),
                           "").bin();
    location++
  }
  $("#artwork").attr("src", artwork);
};

$(document).ready(function () {
  fetch();
});
