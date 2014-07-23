// The hot_cold contract
var contract = "0xf5a508d5d82f66107e5a3b3ad920f6b7318b0966";

// Update the spans with the data from the contact
var fetch = function() {
  document.getElementById("_1000").innerText = eth.storageAt(contract,
                                                             1000).bin();
  document.getElementById("_1001").innerText = eth.storageAt(contract,
                                                             1001).bin();
};

// Allow the user to update the contract state, but warn them it costs gas
var update = function() {
  if (confirm("This costs gas to run.")) {
    eth.transact(eth.key, "0", contract, "0", "10000", eth.gasPrice)
  }
};

// Only show the update link when the mouse moves over the spans
var hider = null;
var temperatures_mousemove = function() {
  clearTimeout(hider);
  $("#update").show();
  hider = setTimeout('$("#update").hide();', 5000);
};

$(document).ready(function () {
  $("#update").hide();
  $("#temperatures").mousemove(temperatures_mousemove);
  // Update when we're notified (and at the start)
  eth.watch(contract, eth.secretToAddress(eth.key), fetch);
  fetch();
});