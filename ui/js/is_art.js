var DEBUG = true;
if (DEBUG && typeof(window.eth) === "undefined") {
  window.eth = {
    'stateAt':function(a,b,c){ return "0x0DEEDEEDEED"; },
    'watch':function(a,b,c){c();},
    'key':"0x0BABABABABA",
    'secretToAddress':function(a){return "0x0DEEDEEDEED"; },
    'transact':function(a,b,c,d,e,f){console.log(d); f();}
  };
}

// The is_art contract
var contract = "0x9ff88526196e302e0ed8665a3c685c2afd16d064";

// Update the spans with the data from the contact
var fetch = function() {
  document.getElementById("_1000").innerText = eth.stateAt(contract, 1000, "").bin();
};

// Allow the user to toggle the contract state, but warn them it costs gas
var toggle = function() {
  if (confirm("This costs gas to run.")) {
    eth.transact(eth.key, "0", contract, "toggle".unbin().pad(32), "10000", eth.gasPrice);
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
  eth.watch(contract, eth.secretToAddress(eth.key), fetch);
  fetch();
});
