// The is_art contract
var contract = "0x95003a1a6a8b1d782f7f78eaa7fec47d21819dcd";

// Update the spans with the data from the contact
var fetch = function() {
  web3.eth.stateAt(contract, "1000").then(function (result) {
  //alert(state);
    var state =  web3.toAscii(result);
    document.getElementById("_1000").innerText = state;
  });
};

// Allow the user to toggle the contract state, but warn them it costs gas
var toggle = function() {
  if (confirm("This costs gas to run.")) {
    web3.eth.transact({from: web3.eth.coinbase, value: 0, to: contract,
                       data: web3.fromAscii("toggle"),
                       gas: 5000, gasPrice: 100000});
  }
};

// Only show the toggle link when the mouse moves over the spans
var hider = null;
var is_it_mousemove = function() {
  clearTimeout(hider);
  $("#toggle").show();
  hider = setTimeout('$("#toggle").hide();', 5000);
};

$(document).ready(function () {
  $("#toggle").hide();
  $("#is_it").mousemove(is_it_mousemove);
  web3.eth.watch({pending: {at: "1000",
                            id: contract}}).changed(fetch);
});
