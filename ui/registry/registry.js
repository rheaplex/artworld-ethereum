////////////////////////////////////////////////////////////////////////////////
// NOTES
// arr stands for "artist resale right".
////////////////////////////////////////////////////////////////////////////////

// TODO:
// Validate user-entered hashes
// Update on hash entry
// File hash entry
// Validate, validate, validate

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

var contract = "0x651d6c01f7db3c38f2c81fe5e927f036e751f095";

////////////////////////////////////////////////////////////////////////////////
// Offsets and lengths within an artwork record
////////////////////////////////////////////////////////////////////////////////

var ARTWORK_DIGEST = 0;
var ARTIST_ADDRESS = 1;
var ARTIST_RESALE_PERCENTAGE = 2;
var CURRENT_OWNER_ADDRESS = 3;
var CURRENT_PURCHASER_ADDRESS = 4;
var CURRENT_SALE_PRICE = 5;
var URL = 6;
var DESC = 36;
var URL_LENGTH = 30;
var DESC_LENGTH = 28;
var CELL_SIZE = 64;

////////////////////////////////////////////////////////////////////////////////
// Where the records are located
////////////////////////////////////////////////////////////////////////////////

var RECORD_BASE = 0x1000;
var RECORD_AFTER_LAST_LOC = 0x10;
var record_after_last = 0;

////////////////////////////////////////////////////////////////////////////////
// Various utilities
////////////////////////////////////////////////////////////////////////////////

// Get the variable-length string starting at the given location

var stringAt = function(location, count) {
  var result = "";
  for(var i = 0; i < count; i++) {
    result += eth.stateAt(contract,
                          "0x" + (location + i).toString(16),
                          0).bin();
  }
  return result;
};

var valAt = function(location_number) {
  var location = "0x" + location_number.toString(16);
  return eth.stateAt(contract, location, 0);
};

// Get the ripemd160 hash for any file on the internet
// The callback receives the data as a single parameter
// This is a horrific hack

var url_ripemd160 = function(url, callback) {
  $.getJSON('http://whateverorigin.org/get?url=' + encodeURIComponent(url)
           + '&callback=?',
            function(data) {
              var digest = "0x" + hex_rmd160(data);
              callback(digest);
            }).fail(function() {
              $("#result").text("Couldn't get digest.");
  });
};

////////////////////////////////////////////////////////////////////////////////
// Contract state changes to watch for
////////////////////////////////////////////////////////////////////////////////

// Keep the last record variable up to date

var update_last_record = function() {
  record_after_last = valAt(RECORD_AFTER_LAST_LOC);
  var count = Math.floor((parseInt(record_after_last, 16) - RECORD_BASE)
                        / CELL_SIZE);
  $("#work_count").text("Serving: " + count + " artworks");
  //$("#result").html(JSON.stringify(get_artwork_details("0x1000")));

  /*$("#result").html("" + valAt(0x1000)
                   + "<br/>" + valAt(0x1001)
                   + "<br/>" + valAt(0x1002)
                   + "<br/>" + valAt(0x1003)
                   + "<br/>" + stringAt(0x1000 + URL, URL_LENGTH)
                   + "<br/>" + stringAt(0x1000 + DESC, DESC_LENGTH)
                   //+ "<br/>" + eth.stateAt(contract, "0x1140", 0).bin()
                   );*/

  //eth.transactions({"to": contract})
};

////////////////////////////////////////////////////////////////////////////////
// Artwork records in the contract storage
////////////////////////////////////////////////////////////////////////////////

// Get the record of the artwork starting at the given location

var get_artwork_details = function(record_location) {
  var location = parseInt(record_location, 16);
  var price = valAt(location + CURRENT_SALE_PRICE);
  var buyer = valAt(location + CURRENT_PURCHASER_ADDRESS);
  return {
    "location": record_location,
    "digest": valAt(location),
    "artist": valAt(location + ARTIST_ADDRESS),
    "arr": parseInt(valAt(location + ARTIST_RESALE_PERCENTAGE), 16),
    "owner": valAt(location + CURRENT_OWNER_ADDRESS),
    "buyer": buyer == "0x" ? "" : buyer,
    "price": price == "0x" ? 0 : parseInt(price, 16),
    "url": stringAt(location + URL, URL_LENGTH),
    "desc": stringAt(location + DESC, DESC_LENGTH)
  };
};

// Get the record of the artwork with the given digest

var digest_artwork_details = function(digest) {
  var record_location = eth.stateAt(contract, digest, 0);
  return get_artwork_details(record_location);
};

// Get just the price of the artwork with the given digest

var get_artwork_price = function(artwork_digest) {
  return digest_artwork_details(artwork_digest)['price'];
};

////////////////////////////////////////////////////////////////////////////////
// Digest generation
////////////////////////////////////////////////////////////////////////////////

var create_url_digest = function() {
  var url = $("#find_url").val();
  $("#find_digest").val("");
  url_ripemd160(url, receive_url_digest);
};

var receive_url_digest = function(digest) {
  update_ui_for_digest(digest);
};

var update_ui_for_digest = function(digest) {
  var location = valAt(digest);
  if(location != "0x") {
    var artwork = get_artwork_details(location);
    var me = eth.secretToAddress(eth.key);
    if(artwork.owner == me) {
      update_offer_ui(artwork);
    }
    // Contract logic: no universal freebies. If changed, change this.
    if((artwork.buyer == me)
        || (artwork.buyer == "" && artwork.price > 0)) {
      update_accept_ui(artwork);
    }
  } else {
    var url = $("#find_url").val();
    clear_ui();
    $("#find_url").val(url);
    $("#find_digest").val(digest);
    $("#register_digest").val(digest);
    $("#register_url").val(url);
  }
};

var update_ui_for_location = function(location) {
  clear_ui();
  if(location) {
    update_accept_ui();
  }
};

////////////////////////////////////////////////////////////////////////////////
// Contract listing
// Revisit when theres more than a few thousand artworks ;-)
////////////////////////////////////////////////////////////////////////////////

var clear_lists = function() {
  $("#list_artist").html("");
  $("#list_owner").html("");
  $("#list_buyer").html("");
  $("#list_other").html("");
};

var append_artist = function(list, artwork) {
  var location = artwork.location.toString(16);
  list.append("<a href='javascript:void(0)' onclick='select_artist_artwork(\"" +
              location + "\");'>"+ artwork.digest +"</a><br/>");
};

var append_owner = function(list, artwork) {
  var location = artwork.location.toString(16);
  list.append("<a href='javascript:void(0)' onclick='select_owner_artwork(\"" +
    location + "\");'>"+ artwork.digest +"</a><br/>");
};

var append_buyer = function(list, artwork) {
  var location = artwork.location.toString(16);
  list.append("<a href='javascript:void(0)' onclick='select_buyer_artwork(\"" +
    location + "\");'>"+ artwork.digest +"</a><br/>");
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
  for(var i = RECORD_BASE; i < record_after_last; i += CELL_SIZE) {
    var artwork = get_artwork_details("0x" + i.toString(16));
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
  $("#offer_digest").value = artwork.digest;
  $("#offer_recipient").value = artwork.buyer;
  $("#offer_price").value = artwork.price;
};

var select_owner_artwork = function(location) {
  var artwork = get_artwork_details(location);
  clear_ui();
  update_offer_ui(artwork);
};

var update_accept_ui = function(artwork) {
  $("#accept_digest").value = artwork.digest;
  $("#accept_arr").value = artwork.arr;
  $("#accept_price").value = artwork.price;
  $("#accept_url").value = artwork.url;
  $("#accept_desc").value = artwork.desc;
};

var select_buyer_artwork = function(location) {
  var artwork = get_artwork_details(location);
  clear_ui();
  update_accept_ui();
  update_artwork_details(artwork);
};

var select_other_artwork = function (location) {
  clear_ui();
  var artwork = get_artwork_details(location);
  update_artwork_details(artwork);
};

var clear_ui = function() {
  $("#result").text("");

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

  $("#offer_digest").val("");
  $("#offer_digest").text("");
  $("#offer_price").text("");

  $("#accept_digest").val("");
};

var update_artwork_details = function(artwork) {
  //$("#result").html(JSON.stringify(artwork));
  $("#artwork_digest").text(artwork.digest);
  $("#artwork_artist").text(artwork.artist);
  $("#artwork_arr").text(artwork.arr);
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
  var arr = $("#register_arr").val();
  var url = $("#register_url").val();
  var desc = $("#register_desc").val();
  if (confirm("This costs gas to run.")) {
    var message = format_register(digest, arr, url, desc);
    var res = eth.transact(eth.key, "0", contract, message, "100000", eth.gasPrice);
    $("result").innerText = res;
  }
};

// Offer an artwork for sale via the contract

var offer_artwork = function() {
  var digest = $("#offer_digest").val();
  var recipient = $("#offer_recipient").val();
  var price = $("#offer_price").val();
  if (confirm("This costs gas to run.")) {
    var message = format_offer(digest, recipient, price);
    var res = eth.transact(eth.key, "0", contract, message, "100000", eth.gasPrice);
    $("result").innerText = res;
  }
};

// Accept an artwork for sale via the contract

var accept_artwork = function() {
  var digest = $("#accept_digest").val();
  // get from storage in case it changes
  var price = get_artwork_price(digest);
  if (confirm("This costs gas to run and will cost" + price + " Wei to buy.")) {
    var message = format_accept(digest);
    var res = eth.transact(eth.key, price, contract, message, "100000", eth.gasPrice);
    $("result").innerText = res;
  }
};

////////////////////////////////////////////////////////////////////////////////
// HTML UI
////////////////////////////////////////////////////////////////////////////////

// Handle the top navigation and resulting section visibility

var sections = ["list", "register", "offer", "accept"];
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
  eth.watch(contract, "0x10", update_last_record);
  update_last_record();
  toggle('list');
};
