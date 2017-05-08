/*  shared.js - Support code.
    Copyright (C) 2016, 2017  Rhea Myers <rob@Rhea Myers.org>

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

var Shared = {};

////////////////////////////////////////////////////////////////////////////////
// Event type conversion
////////////////////////////////////////////////////////////////////////////////

Shared.bytesToString = function (value) {
  return web3.toAscii(value).replace(/\0+$/, "");
};

////////////////////////////////////////////////////////////////////////////////
// Web3
////////////////////////////////////////////////////////////////////////////////

Shared.connectToWeb3 = function () {
  if (typeof web3 !== 'undefined') {
    // Use current provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.log('No web3!');
    var provider = new Web3.providers.HttpProvider("http://localhost:8545");
    window.web3 = new Web3(provider);
  }
};

////////////////////////////////////////////////////////////////////////////////
// ABI wrangling
////////////////////////////////////////////////////////////////////////////////

Shared.instantiateContract = function (contractData) {
  return web3.eth.contract(contractData.abi).at(contractData.address);
};

Shared.installFilter = function (event, spec, callback, errorCallback) {
  return event(spec, function (error, result) {
    if (! error) {
      callback(result);
    } else if (errorCallback) {
      errorCallback(error);
    }
  });
};

////////////////////////////////////////////////////////////////////////////////
// GUI Account display
////////////////////////////////////////////////////////////////////////////////

Shared.selectedGasAccount = function () {
  return $('#gui-gas-account').val();
};

Shared.makeGasAccountList = function (accounts) {
  var select = $('#gui-gas-account');
  select.find('option').remove();
  // Add current
  for (var index in accounts) {
    var account = accounts[index];
    select.append($("<option></option>")
                  .attr("value", account)
                  .text(index + ": " + account));
  }
};

Shared.setupGasAccounts = function () {
  var self = this;
  web3.eth.getAccounts(function(err, accs) {
    if (err != null) {
      alert("There was an error fetching your accounts.");
      return;
    }
    if (accs.length == 0) {
      alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
      return;
    }

    self.makeGasAccountList(accs);
  });
};

////////////////////////////////////////////////////////////////////////////////
// UI configuration, state and interaction
////////////////////////////////////////////////////////////////////////////////

Shared.gui_is_showing = false;

Shared.state_is_updating = false;

Shared.gui_display_hook = false;

Shared.showGui = function () {
  if (! this.state_is_updating) {
    // Showing newly added account is better than keeping previous selection
    this.setupGasAccounts();
    $('.gui').show();
    this.gui_is_showing = true;
    if (this.gui_display_hook !== false) {
      this.gui_display_hook();
    }
  }
};

Shared.hideGui = function () {
  $('.gui').hide();
  this.gui_is_showing = false
};

Shared.showUpdating = function () {
  $('#updating').show();
  this.state_is_updating = true;
};

Shared.hideUpdating = function () {
  $('#updating').hide();
  this.state_is_updating = false
};

Shared.setStatus = function (message) {
  $('#status').text(message).show();
};

Shared.hideStatus = function () {
  $('#status').text('').hide();
};

Shared.stopRunning = function (message) {
  $('#representation').hide();
  // Disable clicking to show the gui
  $('#background').prop('onclick',null);
  this.hideUpdating();
  this.hideGui();
  this.setStatus(message);
};

////////////////////////////////////////////////////////////////////////////////
// Shared setup
////////////////////////////////////////////////////////////////////////////////

Shared.init = function (_gui_display_hook) {
  if (_gui_display_hook) {
    this.gui_display_hook = _gui_display_hook;
  }
  this.connectToWeb3();
  if (typeof web3 === 'undefined') {
    this.stopRunning('Cannot connect to the Ethereum network.');
  } else {
    this.hideStatus();
    this.hideGui();
    this.hideUpdating();
  }
};
