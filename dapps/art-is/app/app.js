/*  ArtIs - Ethereum contract to define art.
    Copyright (C) 2015, 2016, 2017  Rob Myers <rob@robmyers.org>

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

const ArtIsGui = {};

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
  "what it is because",
  "good because it is", "bad because it is",
  "moral because it is", "immoral because it is",
  "creepy because it is",
  "interesting because it is", "boring because it is",
  "paradoxically", "slightly", "somewhat", "very", "totally",
  "always", "never", "sometimes",
];

ArtIsGui.connection = [
  "not",
  "universally",
  "ontologically", "epistemologically", "logically",
  "psychologically",
  "childishly", "sophisticatedly", "conservatively",
  "liberally", "ironically",
  "creepily", "radically", "queerly", "problematically",
  "neoliberally"
];

ArtIsGui.relation = [
  "engaging with",
  "reliant on", "derivative of", "determined by", "defined by",
  "embracing of",
  "reacting to", "commenting on", "embracing", "resolving",
  "transcending",
  "valenced by", "critiquing", "attacking", "destroying",
  "obviating"
];

ArtIsGui.subject = [
  "specificity",
  "techne", "society", "politics", "materiality", "identity",
  "emotion", "critique", "aesthetics", "god", "satan",
  "beauty", "horror", "desire", "critique", "universality"
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

ArtIsGui.setSelectOptions = function (selectName, options) {
  const $sel = $(selectName);
  $sel.empty();
  let index = 0;
  options.forEach(key => {
    $sel.append($("<option></option>")
                .attr("value", index).html([key]));
    index++;
  });
};

ArtIsGui.populateSelects = function () {
  for(let i = 0; i < this.selects.length; i++) {
    this.setSelectOptions(this.selects[i], this.options[i]);
  }
};

ArtIsGui.setSelect = function (select, num, index) {
  $(select + " :nth-child(" + (parseInt(num[index], 16) + 1) + ")")
    .prop('selected', true);
};

ArtIsGui.setSelectsFromNum = function (num) {
  for(let i = 0; i < this.selects.length; i++) {
    this.set_select(this.selects[i], num, 3 + (i * 2));
  }
};

////////////////////////////////////////////////////////////////////////////////
// UI state generation and validation
////////////////////////////////////////////////////////////////////////////////

ArtIsGui.price_to_set_description = function (index) {
  return this.PRICES[index];
};

ArtIsGui.selectedAccountCanAffordPrice = function(index, callback) {
  // EstimateGas hates us, so don't use it.
  web3.eth.getGasPrice((error, gasPrice) => {
    // Vague estimate from testrpc
    const estimate = gasPrice.toNumber() * 51630;
    const price = this.price_to_set_description(index);
    const totalCost = estimate + price;
    const selectedAccount = Shared.selectedGasAccount();
    web3.eth.getBalance(selectedAccount, (error, accountBalance) =>
                        callback(error, totalCost <= accountBalance));
  });
};

ArtIsGui.update_change_definition_ui = function (index) {
  $('#update-button').prop('disabled', true);
  $('#price-warning').html('&nbsp;');
  this.contract.definitions.call(index).then(description => {
    // description 0 is the theorist
    $("#change-definition-extent").val(description[1].toNumber());
    $("#change-definition-connection").val(description[2].toNumber());
    $("#change-definition-relation").val(description[3].toNumber());
    $("#change-definition-subject").val(description[4].toNumber());
    const price = this.price_to_set_description(index);
    $("#price").text(price);
    this.selectedAccountCanAffordPrice(index, (error, can) => {
      if ((! error) && can) {
        $('#update-button').prop('disabled', false);
      } else {
        $('#price-warning').text('Selected account has insufficient funds.');
      }
    });
    // http://bluebirdjs.com/docs/warning-explanations.html#warning-a-promise-was-created-in-a-handler-but-was-not-returned-from-it
    return null;
  });
};

////////////////////////////////////////////////////////////////////////////////
// Displaying definitions
////////////////////////////////////////////////////////////////////////////////

ArtIsGui.formatValues = function (values) {
  let desc = "";
  this.options.forEach((options, index) => {
    const value = values[index];
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
  this.contract.definitions.call(index).then(description => {
    const displayIndex = index + 1;
    let row = "<th scope=\"row\">" + displayIndex + "</th>";
    if(this.isDescNonzero(description)) {
      const theorist = description[0];
      const values = description.slice(1);
      row += "<td>Art is " + this.formatValues(values)
        + ".</td><td><span class=\"theorist\">" + theorist
        + "</span></td>";
    } else {
      row += "<td>&mdash;</td><td></td>";
    }
    $(".definition").eq(index).html(row);
  });
};

ArtIsGui.describeArt = function () {
  for(let i = 0; i < this.NUM_DESCS; i++) {
    this.displayDescription(i);
  }
};

////////////////////////////////////////////////////////////////////////////////
// Changing (and watching for changes of) the definitions' states
////////////////////////////////////////////////////////////////////////////////

ArtIsGui.changeDefinition = function () {
  const index = this.editing_definition_index;
  const extent = $("#change-definition-extent").val();
  const connection = $("#change-definition-connection").val();
  const relation = $("#change-definition-relation").val();
  const subject = $("#change-definition-subject").val();
  const account = Shared.selectedGasAccount();
  const price = this.price_to_set_description(index);
  this.contract.setDefinition(index,
                              extent, connection, relation, subject,
                              {from: account, value: price})
    .catch(e => alert ("Something went wrong. You probably didn't have enough Ether in your account (despite what the dialog may have told you)."))
    .finally(() => Shared.hideUpdating());
};

////////////////////////////////////////////////////////////////////////////////
// Contract manipulation GUI
////////////////////////////////////////////////////////////////////////////////

// Called from Shared, so be careful with the value of 'this'.

ArtIsGui.guiDisplayHook = function () {
  $("#art-is").hide();
  const index = ArtIsGui.editing_definition_index;
  $('#change-definition-index').text(index + 1);
  ArtIsGui.update_change_definition_ui(index);
};

ArtIsGui.gasAccountChanged = function () {
  account = Shared.selectedGasAccount();
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
  $("#definitions tbody tr").hover(
    e => {
      const index = $(e.currentTarget).index();
      $(".definition").eq(index).addClass("highlight");
    },
    e => {
      const index = $(e.currentTarget).index();
      $(".definition").eq(index).removeClass("highlight");
    });
  $("#definitions tbody tr").click(
    e => {
      const index = 0 + $(e.currentTarget).index();
      this.editing_definition_index = index;
      Shared.showGui();
    });
};

ArtIsGui.connectToWeb3 = function () {
  if (typeof web3 !== 'undefined') {
    // Use current provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.log('No web3 provided. Making one.');
    const provider = new Web3.providers.HttpProvider("http://localhost:8545");
    window.web3 = new Web3(provider);
  }
};

ArtIsGui.initialise = function () {
  this.connectToWeb3();
  Shared.init(this.guiDisplayHook);
  this.populateSelects();
  this.installInteractions();
  Shared.setGasAccountChangedCallback(this.gasAccountChanged, true);
  ArtIs.deployed().then(instance => {
    this.contract = instance;
    this.contract
      .DefinitionChanged({}, (error, result) => {
        if (! error) {
          this.describeArt()
          // Hide updating when tx is mined.
          // Any update will do this,
          // so it's not ideal.
          // But it's better than nothing.
          Shared.hideUpdating();
        }
      });
    this.describeArt();
    // Silence "a promise was created in a handler but was not returned from it"
    // resulting from all the promises created in describeArt().
    // http://bluebirdjs.com/docs/warning-explanations.html
    return null;
  });
};

$(window).on('load', () => {
  ArtIsGui.initialise();
});
