/*  ArtIs - Ethereum contract to define art.
    Copyright (C) 2015, 2016, 2017  Rhea Myers <rob@Rhea Myers.org>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

////////////////////////////////////////////////////////////////////////////////
// The main contract behaviour object
////////////////////////////////////////////////////////////////////////////////

var ArtIsGui = {};

ArtIsGui.NUM_DESCS = 12;

ArtIsGui.PRICES = [
  1, // 1 Wei
  10,
  100,
  500,
  1000, // 1 Ada
  500000,
  1000000, // 1 Babbage
  500000000,
  1000000000, // 1 Shannon
  1000000000000, // 1 Szabo
  1000000000000000, // 1 Finney
  1000000000000000000 // 1 Ether
];

ArtIsGui.indexes = [1,2,3,4,5,6,7,8,9,10,11,12];

ArtIsGui.extent = [
  "",
  "good because it is", "bad because it is",
  "moral because it is", "immoral because it is",
  "creepy because it is",
  "interesting because it is", "boring because it is",
  "paradoxically", "slightly", "somewhat", "very", "totally",
  "always", "never", "sometimes",
];

ArtIsGui.connection = [
  "",
  "not",
  "ontologically", "epistemologically", "logically",
  "psychologically",
  "childishly", "sophisticatedly", "conservatively",
  "liberally", "ironically",
  "creepily", "radically", "queerly", "problematically",
  "neoliberally"
];

ArtIsGui.relation = [
  "",
  "reliant on", "derivative of", "determined by", "defined by",
  "embracing of",
  "reacting to", "commenting on", "embracing", "resolving",
  "transcending",
  "valenced by", "critiquing", "attacking", "destroying",
  "obviating"
];

ArtIsGui.subject = [
  "",
  "techne", "society", "politics", "materiality", "identity",
  "emotion", "critique", "aesthetics", "god", "satan",
  "beauty", "horror", "desire", "critique", "revolution"
];

ArtIsGui.options = [ArtIsGui.extent, ArtIsGui.connection, ArtIsGui.relation,
                   ArtIsGui.subject];

ArtIsGui.selects = ["#change-definition-extent",
                    "#change-definition-connection",
                    "#change-definition-relation",
                    "#change-definition-subject"];

////////////////////////////////////////////////////////////////////////////////
// Contract manipulation GUI
////////////////////////////////////////////////////////////////////////////////

ArtIsGui.setSelectOptions = function(selectName, options) {
  var $sel = $(selectName);
  $sel.empty();
  var index = 0;
  options.forEach(function(key) {
    if (key == "") {
      key = "—";
    }
    $sel.append($("<option></option>")
                .attr("value", index).html([key]));
    index++;
  });
};

ArtIsGui.populateSelects = function() {
  for(var i = 0; i < this.selects.length; i++) {
    this.setSelectOptions(this.selects[i], this.options[i]);
  }
};

ArtIsGui.setSelect = function(select, num, index) {
  $(select + " :nth-child(" + (parseInt(num[index], 16) + 1) + ")")
    .prop('selected', true);
};

ArtIsGui.setSelectsFromNum = function(num) {
  for(var i = 0; i < this.selects.length; i++) {
    this.set_select(this.selects[i], num, 3 + (i * 2));
  }
};

////////////////////////////////////////////////////////////////////////////////
// UI state generation and validation
////////////////////////////////////////////////////////////////////////////////

ArtIsGui.is_valid_definition = function(index) {
  var result = true;
  // Just make sure one of the last options has been chosen
  var i = this.selects.length - 1;
  //for(var i = 0; i < selects.length; i++) {
  if (parseInt($(this.selects[i]).val(), 10) == 0) {
    result = false;
    //break;
  }
  //}
  return result;
};

ArtIsGui.price_to_set_description = function (index) {
  return this.PRICES[index];
};

ArtIsGui.selectedAccountCanAffordPrice = function (index, callback) {
  var price = this.price_to_set_description(index);
  var selectedAccount = $('#gui-gas-account').val();
  web3.eth.getBalance(selectedAccount, function (error, accountBalance) {
    // The gas will always be more than this, but this is what we are asking
    callback(error, price <= accountBalance);
  });
}

ArtIsGui.update_change_definition_ui = function(index) {
  var self = this;
  $('#update-button').prop('disabled', true);
  this.contract.definitions.call(index).then(function(description) {
    // description 0 is the theorist
    $("#change-definition-extent").val(description[1].toNumber());
    $("#change-definition-connection").val(description[2].toNumber());
    $("#change-definition-relation").val(description[3].toNumber());
    $("#change-definition-subject").val(description[4].toNumber());
    var price = self.price_to_set_description(index);
    $("#price").text(price);
    self.selectedAccountCanAffordPrice(index, function (error, can) {
      if ((! error) && can) {
        $('#update-button').prop('disabled', false);
      } else {
        // TODO: Tell the user.
      }
    });
  });
};

////////////////////////////////////////////////////////////////////////////////
// Displaying definitions
////////////////////////////////////////////////////////////////////////////////

ArtIsGui.formatValues = function(values) {
  var desc = "";
  this.options.forEach(function (options, index) {
    var value = values[index];
    if (value != 0) {
      desc += options[value] + " ";
    }
  });
  return desc.trim();
};

ArtIsGui.isDescNonzero = function (description) {
  return (description[1] + description[2] + description[3] + description[4])
    != 0;
};

ArtIsGui.displayDescription = function (index) {
  var self = this;
  this.contract.definitions.call(index).then(function(description) {
    var displayIndex = index + 1;
    var row = "<th scope=\"row\">" + displayIndex + "</th>";
    if(self.isDescNonzero(description)) {
      var theorist = description[0];
      var values = description.slice(1);
      row += "<td>Art is " + self.formatValues(values)
        + ".</td><td><span class=\"theorist\">" + theorist
        + "</span></td>";
    } else {
      row += "<td>&mdash;</td><td></td>";
    }
    $(".definition").eq(index).html(row);
  });
};

ArtIsGui.describeArt = function() {
  for(var i = 0; i < this.NUM_DESCS; i++) {
    this.displayDescription(i);
  }
};

////////////////////////////////////////////////////////////////////////////////
// Changing (and watching for changes of) the definitions' states
////////////////////////////////////////////////////////////////////////////////

ArtIsGui.changeDefinition = function() {
  var index = this.editing_definition_index;
  if(this.is_valid_definition(index)) {
    var extent = $("#change-definition-extent").val();
    var connection = $("#change-definition-connection").val();
    var relation = $("#change-definition-relation").val();
    var subject = $("#change-definition-subject").val();
    var account = Shared.selectedGasAccount();
    var price = this.price_to_set_description(index);
    ArtIsGui.contract.setDefinition(index,
                                    extent, connection, relation, subject,
                                    {from: account, value: price})
      .then(function() { Shared.hideUpdating(); });
  } else {
    alert("Please select an option for each part of the definition.");
  }
};

////////////////////////////////////////////////////////////////////////////////
// Contract manipulation GUI
////////////////////////////////////////////////////////////////////////////////

// Called from Shared, so be careful with the value of 'this'.

ArtIsGui.guiDisplayHook = function () {
  $("#art-is").hide();
  var index = ArtIsGui.editing_definition_index;
  $('#change-definition-index').text(index + 1);
  ArtIsGui.update_change_definition_ui(index);
};

////////////////////////////////////////////////////////////////////////////////
// GUI user actions
////////////////////////////////////////////////////////////////////////////////

ArtIsGui.userSelectedUpdate = function () {
  Shared.showUpdating();
  Shared.hideGui();
  $("#art-is").show();
  ArtIsGui.changeDefinition();
};

ArtIsGui.userSelectedCancel = function () {
  this.editing_definition_index = undefined;
  Shared.hideGui();
  $("#art-is").show();
};

////////////////////////////////////////////////////////////////////////////////
// Main Program Lifecycle
////////////////////////////////////////////////////////////////////////////////

ArtIsGui.installInteractions = function () {
  var self = this;
  $("#definitions tbody tr").hover(
    function(e){
      var index = $(e.currentTarget).index();
      $(".definition").eq(index).addClass("highlight");
    },
    function(e){
      var index = $(e.currentTarget).index();
      $(".definition").eq(index).removeClass("highlight");
    });
  $("#definitions tbody tr").click(
    function(e) {
      var index = 0 + $(e.currentTarget).index();
      self.editing_definition_index = index;
      Shared.showGui();
    });
};

ArtIsGui.connectToWeb3 = function () {
  if (typeof web3 !== 'undefined') {
    // Use current provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.log('No web3 provided. Making one.');
    var provider = new Web3.providers.HttpProvider("http://localhost:8545");
    window.web3 = new Web3(provider);
  }
};

$(window).on('load', function () {
  ArtIsGui.connectToWeb3();
  Shared.init(ArtIsGui.guiDisplayHook);
  ArtIsGui.populateSelects();
  ArtIsGui.installInteractions();
  ArtIs.deployed().then(function(instance) {
    ArtIsGui.contract = instance;
    ArtIsGui.contract
      .DefinitionChanged({}, function(error, result) {
        if (! error) {
          ArtIsGui.describeArt()
          // Hide updating when tx is mined.
          // Any update will do this,
          // so it's not ideal.
          // But it's better than nothing.
          Shared.hideUpdating();
        }
      });
    ArtIsGui.describeArt();
    // Silence "a promise was created in a handler but was not returned from it"
    // resulting from all the promises created in describeArt().
    // http://bluebirdjs.com/docs/warning-explanations.html
    return null;
  });
});
