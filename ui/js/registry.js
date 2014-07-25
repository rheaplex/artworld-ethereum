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

var contract = "0xaf1206fcb32fbdb42878c429e61a49d5143e6f32";

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

var RECORD_BASE = bigInt("0x10000000000000000000000000000000000000000");
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
                          location.add(i),
                          0).bin();
  }
  return result;
};

var valAt = function(location_number) {
  return eth.stateAt(contract, location_number, 0);
};

// Get the ripemd160 hash for any file on the internet
// The callback receives the data as a single parameter
// This is a horrific hack

var url_ripemd160 = function(url, callback) {
  $.getJSON('http://whateverorigin.org/get?url=' + encodeURIComponent(url)
           + '&callback=?',
            function(data) {
              var digest = "0x" + hex_rmd160(data.contents);
              callback(digest);
            }).fail(function() {
              $("#result").text("<i>Couldn't get digest.</i>")
  });
};

////////////////////////////////////////////////////////////////////////////////
// Contract state changes to watch for
////////////////////////////////////////////////////////////////////////////////

// Keep the last record variable up to date

var update_last_record = function() {
  record_after_last = bigInt(valAt(RECORD_AFTER_LAST_LOC));
  var count = record_after_last.minus(RECORD_BASE) / CELL_SIZE;
  $("#work_count").html("Serving <i>" + count + "</i> artworks");
};

////////////////////////////////////////////////////////////////////////////////
// Artwork records in the contract storage
////////////////////////////////////////////////////////////////////////////////

// Get the record of the artwork starting at the given location
// location_spec can be a string containing a hex number, or it can be a bigInt

var get_artwork_details = function(location_spec) {
  var location = bigInt(location_spec);
  var price = valAt(location.add(CURRENT_SALE_PRICE));
  var buyer = valAt(location.add(CURRENT_PURCHASER_ADDRESS));
  return {
    "location": location.toHex(),
    "digest": valAt(location),
    "artist": valAt(location.add(ARTIST_ADDRESS)),
    "arr": parseInt(valAt(location.add(ARTIST_RESALE_PERCENTAGE)), 16),
    "owner": valAt(location.add(CURRENT_OWNER_ADDRESS)),
    "buyer": buyer == "0x" ? "" : buyer,
    "price": price == "0x" ? 0 : parseInt(price, 16),
    "url": stringAt(location.add(URL), URL_LENGTH),
    "desc": stringAt(location.add(DESC), DESC_LENGTH)
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
  $("debug").text(digest);
  update_ui_for_digest(digest);
};

var update_ui_for_digest = function(digest) {
  var location = valAt(digest);
  var url = $("#find_url").val();
  clear_ui();
  // Having cleared the UI, restore the URL and set the digest
  $("#find_url").val(url);
  $("#find_digest").val(digest);
  if(location != "0x") {
    // If the work is already registered, set the UI from the artwork details
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
    update_artwork_details(artwork);
  } else {
    // Otherwise, set up the register UI
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
