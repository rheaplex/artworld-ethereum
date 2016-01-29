var DEBUG = true;
if (DEBUG && typeof(window.eth) === "undefined") {
      window.eth = {
        'stateAt':function(a,b,c){return c;},
        'watch':function(a,b,c){c();},
        'key':"0x0BABABABABA",
        'secretToAddress':function(a){return "0x0DEEDEEDEED"; },
        'transact':function(a,b,c,d,e,f){console.log(d); f();}
      };
}

////////////////////////////////////////////////////////////////////////////////
// The contract
////////////////////////////////////////////////////////////////////////////////

var contract = "0xaf1206fcb32fbdb42878c429e61a49d5143e6f32";

////////////////////////////////////////////////////////////////////////////////
// Offsets and lengths within an artwork record
////////////////////////////////////////////////////////////////////////////////

var PRICE = "0x11";
var OWNER = "0x12";
var OWNER_UNTIL = "0x13";

////////////////////////////////////////////////////////////////////////////////
// Next sale time
////////////////////////////////////////////////////////////////////////////////

var owner = "";
var owner_until = 0;
var price = 0;

var udate_state = function () {
  owner = eth.stateAt(contract, OWNER, "0x0").bin();;
  owner_until = eth.stateAt(contract, OWNER_UNTIL, "0x0").parseInt(16);
  price = eth.stateAt(contract, PRICE, "0x0").parseInt(16);
  if(owner_until < ) {
    $("#purchase_div").show();
  } else {
    $("#purchase_div").show();
  }
};


var append_other = function(list, artwork) {
  var location = artwork.location.toString(16);
  list.append("<a href='javascript:void(0)' onclick='select_other_artwork(\"" +
              location + "\");'>"+ artwork.digest +"</a><br/>");
};

var list_contracts = function() {
  var artist_list = $("#list_artist");
  var owner_list = $("#list_owner");
  var buyer_list = $("#list_buyer");
  var other_list = $("#list_other");
  clear_lists();
  var me = eth.secretToAddress(eth.key);
  // i is a bigInt, don't use standard math!
  for(var i = RECORD_BASE; i.lesser(record_after_last); i = i.plus(CELL_SIZE)) {
    var artwork = get_artwork_details(i);
    var other = true;
    if(artwork.artist == me) {
      append_artist(artist_list, artwork);
      other = false;
    }
    if(artwork.owner == me) {
      append_owner(owner_list, artwork);
      other = false;
    }
    // Contract logic: no universal freebies. If changed, change this.
    if((artwork.buyer == me)
        || (artwork.buyer == "" && artwork.price > 0)) {
      append_buyer(buyer_list, artwork);
      other = false;
    }
    if(other) {
      append_other(other_list, artwork);
    }
  }
};

var select_artist_artwork = function(location) {
  var artwork = get_artwork_details(location);
  clear_ui();
  update_artwork_details(artwork);
};

var update_offer_ui = function(artwork) {
  $("#offer_digest").text(artwork.digest);
  $("#offer_recipient").val(artwork.buyer);
  $("#offer_price").val(artwork.price);
};

var select_owner_artwork = function(location) {
  var artwork = get_artwork_details(location);
  clear_ui();
  update_offer_ui(artwork);
  update_artwork_details(artwork);
};

var update_accept_ui = function(artwork) {
  $("#accept_digest").text(artwork.digest);
  $("#accept_arr").text(artwork.arr + "%");
  $("#accept_price").text(artwork.price);
  $("#accept_url").text(artwork.url);
  $("#accept_desc").text(artwork.desc);
};

var select_buyer_artwork = function(location) {
  var artwork = get_artwork_details(location);
  clear_ui();
  update_accept_ui(artwork);
  update_artwork_details(artwork);
};

var select_other_artwork = function (location) {
  clear_ui();
  var artwork = get_artwork_details(location);
  update_artwork_details(artwork);
};

var clear_ui = function() {
  $("#result").text("");
  $("#find_url").val("");
  $("#find_digest").val("");

  $("#artwork_digest").text("");
  $("#artwork_artist").text("");
  $("#artwork_arr").text("");
  $("#artwork_owner").text("");
  $("#artwork_buyer").text("");
  $("#artwork_price").text("");
  $("#artwork_url").text("");
  $("#artwork_desc").text("");

  $("#register_digest").val("");
  $("#register_arr").val("");
  $("#register_url").val("");
  $("#register_desc").val("");

  $("#offer_digest").text("");
  $("#offer_recipient").val("");
  $("#offer_price").val("0");

  $("#accept_digest").text("");
  $("#accept_arr").text("");
  $("#accept_price").text("");
  $("#accept_url").text("");
  $("#accept_desc").text("");
};

var update_artwork_details = function(artwork) {
  //$("#result").html(JSON.stringify(artwork));
  $("#artwork_digest").text(artwork.digest);
  $("#artwork_artist").text(artwork.artist);
  $("#artwork_arr").text(artwork.arr + "%");
  $("#artwork_owner").text(artwork.owner);
  $("#artwork_buyer").text(artwork.buyer);
  $("#artwork_price").text(artwork.price);
  $("#artwork_url").text(artwork.url);
  $("#artwork_desc").text(artwork.desc);
};

////////////////////////////////////////////////////////////////////////////////
// Contract messaging
////////////////////////////////////////////////////////////////////////////////

// Format the message for an artwork registration request

var format_register = function(digest, arr, url, desc) {
  return "register".unbin().pad(0,32) + digest.pad(32)
       + arr.pad(32) + url.pad(URL_LENGTH * 32) + desc.pad(DESC_LENGTH * 32);
};

// Format the message for an artwork sale offer request

var format_offer = function(digest, recipient, price) {
  return "offer".unbin().pad(0,32) + digest.pad(32) + recipient.pad(32)
       + price.pad(32);
};

// Format the message for an artwork sale registration request

var format_accept = function(digest) {
  return "accept".unbin().pad(0,32) + digest.pad(32);
};

// Register an artwork with the contract

var register_artwork = function() {
  var digest = $("#register_digest").val();
  if(digest) {
    var arr = $("#register_arr").val();
    var url = $("#register_url").val();
    var desc = $("#register_desc").val();
    if (confirm("This costs gas to run.")) {
      var message = format_register(digest, arr, url, desc);
      eth.transact(eth.key, "0", contract, message, "100000", eth.gasPrice);
      clear_ui();
      $("#result").html("<i>Registered " + digest + "</i>");
    }
  }
};

// Offer an artwork for sale via the contract

var offer_artwork = function() {
  var digest = $("#offer_digest").text();
  if(digest) {
    var recipient = $("#offer_recipient").val();
    var price = $("#offer_price").val();
    if (confirm("This costs gas to run.")) {
      var message = format_offer(digest, recipient, price);
      eth.transact(eth.key, "0", contract, message, "100000", eth.gasPrice);
    clear_ui();
      $("#result").html("<i>Offered " + digest + " for sale for " + price + " Wei.</i>");
    }
  }
};

// Accept an artwork for sale via the contract

var accept_artwork = function() {
  var digest = $("#accept_digest").text();
  if(digest) {
    // get from storage in case it changes
    var price = get_artwork_price(digest);
    if (confirm("This costs gas to run and will cost " + price + " Wei to buy.")) {
      var message = format_accept(digest);
      eth.transact(eth.key, price, contract, message, "100000", eth.gasPrice);
      clear_ui();
      $("#result").html("<i>Bought " + digest + "</i>");
    }
  }
};

////////////////////////////////////////////////////////////////////////////////
// HTML UI
////////////////////////////////////////////////////////////////////////////////

// Handle the top navigation and resulting section visibility

var toggle = function(which) {
  for (var sec = 0; sec < sections.length; sec++){
    var name = sections[sec];
    var div = "#" + name + "_div";
    if (name == which) {
      $(div).show();
    } else {
      $(div).hide();
    }
  }
  if(which == "list") {
    list_contracts();
  }
};

window.onload = function(){
  $("#purchase_div").hide();
  eth.watch(contract, OWNER, update_state);
  update_state();
  toggle('list');
};
