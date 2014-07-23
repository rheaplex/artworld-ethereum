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

////////////////////////////////////////////////////////////////////////////////
// Configuration
////////////////////////////////////////////////////////////////////////////////

var contract = "0xa7e093109d00fbea8436472658d1aaa3f76aac62";

var price_base = 10;
var price_factor_add = 10; // + 12 = 22, 10 ^ 18 = Ether
var num_descs = 12;
var defs_base = 0x100;
var theorists_base = 0x200;

var indexes = [1,2,3,4,5,6,7,8,9,10,11,12];

var extent = ["",
              "good because it is", "bad because it is", "moral because it is",
              "immoral because it is", "creepy because it is",
              "paradoxically", "slightly", "somewhat", "very", "totally",
              "always", "never", "sometimes",
              "", ""
              ];

var connection = ["",
                  "not",
                  "ontologically", "epistemologically", "logically",
                  "psychologically",
                  "childishly", "sophisticatedly", "conservatively",
                  "liberally", "ironically",
                  "creepily", "radically", "queerly", "problematically",
                  "neoliberally"];

var relation = ["",
                "reliant on", "derivative of", "determined by", "defined by",
                "embracing of",
                "reacting to", "commenting on", "embracing", "resolving",
                "transcending",
                "valenced by", "critiquing", "attacking", "destroying",
                "obviating"];

var subject = ["",
               "techne", "society", "politics", "materiality", "identity",
               "emotion", "critique", "aesthetics", "god", "satan",
               "beauty", "horror", "desire", "critique", "revolution"];

var options = [extent, connection, relation, subject];
var selects = ["#change_definition_extent", "#change_definition_connection",
               "#change_definition_relation", "#change_definition_subject"];

////////////////////////////////////////////////////////////////////////////////
// Set up the selects in the UI
////////////////////////////////////////////////////////////////////////////////

var set_select_options = function(select_name, options) {
  var $sel = $(select_name);
  $sel.empty();
  var index = 0;
  options.forEach(function(key) {
    $sel.append($("<option></option>")
                .attr("value", index).text([key]));
    index++;
  });
};

var populate_selects = function() {
  set_select_options("#change_definition_index", indexes);
  for(var i = 0; i < selects.length; i++) {
    set_select_options(selects[i], options[i]);
  }
};

var set_select = function(select, num, index) {
  $(select + " :nth-child(" + (parseInt(num[index], 16) + 1) + ")").prop('selected', true);
};

var set_selects_from_num = function(num) {
  for(var i = 0; i < selects.length; i++) {
    set_select(selects[i], num, 3 + (i * 2));
  }
};

////////////////////////////////////////////////////////////////////////////////
// UI state generation and validation
////////////////////////////////////////////////////////////////////////////////

var is_valid_definition = function(num) {
  var result = true;
  // Just make sure one of the last options has been chosen
  var i = selects.length - 1;
  //for(var i = 0; i < selects.length; i++) {
  if (parseInt($(selects[i]).val(), 10) == 0) {
    result = false;
    //break;
  }
  //}
  return result;
};

var price_to_set_description = function () {
  var price_index = parseInt($("#change_definition_index").val(), 10);
  return Math.pow(price_base, (price_index + 1 + price_factor_add));
};

var update_change_definition_ui = function() {
  var definition = parseInt($("#change_definition_index").val(), 10);
  var num = eth.stateAt(contract, defs_base + definition, 0);
  if(num == "0x") { num = "0x000000000000"; }
  $("#definition_to_change").text(number_to_desc(num));
  set_selects_from_num(num);
  var price = price_to_set_description();
  $("#price").text(price);
  if (price < eth.balanceAt(eth.secretToAddress(eth.key))) {
    $("#change").show();
  } else {
    $("#change").hide();
  }
};

////////////////////////////////////////////////////////////////////////////////
// Converting descriptions to numbers and back
////////////////////////////////////////////////////////////////////////////////

var desc_to_number = function() {
  var num = "0x";
  for(var i = 0; i < selects.length; i++) {
    num += "0" + parseInt($(selects[i]).val(), 10).toString(16)
  }
  return num;
};

var number_to_desc = function(num) {
  var desc = "";
  for(var i = 0; i < selects.length; i++) {
    desc += " " + options[i][parseInt(num[3 + (i * 2)], 16)];
  }
  return desc.replace( / +/g, ' ' ).trim();
};

var describe_art = function() {
  var description = "<ol>";
  for(var i = 0; i < num_descs; i++) {
    var num = eth.stateAt(contract, defs_base + i, 0);
    if(num == "0x") {
      description += "<li><a href='javascript:void(0);' onclick='display_change_definition("
                   + i + ");'>&mdash;"
                   + "</a></li>";
    } else {
      description += "<li><a href='javascript:void(0);' onclick='display_change_definition("
                   + i + ");'>Art is " + number_to_desc(num)
                   + ".</a> <i>(" + eth.stateAt(contract, theorists_base + i, 0)
                   + ")</i></li>";
    }
  }
  description += "</ol>";
  $("#definition").html(description);
};

////////////////////////////////////////////////////////////////////////////////
// Changing (and watching for changes of) the definitions' states
////////////////////////////////////////////////////////////////////////////////

var storage_changed = function() {
  describe_art();
  update_change_definition_ui();
};

var change_definition = function() {
  if(is_valid_definition()) {
    var index = "0x" + parseInt($("#change_definition_index").val(), 10).toString(16);
    var price = price_to_set_description();
    if (confirm("Continuing requires paying " + price + " Wei (and gas).")) {
      var args = "set".unbin().pad(0,32) + index.pad(32) + desc_to_number().pad(32);
      eth.transact(eth.key, "0x" + price.toString(16), contract, args, "10000", eth.gasPrice);
    }
  } else {
    alert("Please select an option for each part of the definition.");
  }
};

var display_change_definition = function(index) {
  $("#change_definition_index :nth-child(" + (index + 1) + ")").prop('selected', true);
  update_change_definition_ui();
  $("#change_section").show();
};

var cancel_change_definition = function() {
  $("#change_section").hide();
};

////////////////////////////////////////////////////////////////////////////////
// Document setup
////////////////////////////////////////////////////////////////////////////////

$(document).ready(function () {
  populate_selects();
  eth.watch(contract, eth.secretToAddress(eth.key), storage_changed);
  storage_changed();
});
