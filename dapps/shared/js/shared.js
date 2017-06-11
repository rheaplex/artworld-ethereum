/*  shared.js - Support code.
    Copyright (C) 2016, 2017  Rob Myers <rob@robmyers.org>

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
  // Strings from events are null padded, remove the nulls.
  return web3.toAscii(value).replace(/\0+$/, "");
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
      Shared.stopRunning("There was an error fetching your accounts.");
      return;
    }
    if (accs.length == 0) {
      Shared.stopRunning("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
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
  this.gui_is_showing = false;
};

Shared.showUpdating = function () {
  $('#updating').show();
  this.state_is_updating = true;
};

Shared.hideUpdating = function () {
  $('#updating').hide();
  this.state_is_updating = false;
};

Shared.showRepresentation = function () {
  $('#representation').show();
};

Shared.setStatus = function (message) {
  $('#status').html(message).show();
};

Shared.hideStatus = function () {
  $('#status').html('').hide();
};

Shared.stopRunning = function (message) {
  $('#representation').hide();
  // Disable clicking to display the gui
  $('#background').prop('onclick',null);
  this.hideUpdating();
  this.hideGui();
  this.setStatus(message);
};

////////////////////////////////////////////////////////////////////////////////
// Shared setup
////////////////////////////////////////////////////////////////////////////////

Shared.init = function (_gui_display_hook, callWhenReady) {
  if (_gui_display_hook) {
    this.gui_display_hook = _gui_display_hook;
  }
  if (typeof web3 !== 'undefined') {
    // Use injected provider from Mist or Metamask etc.
    window.web3 = new Web3(web3.currentProvider);
    if (callWhenReady) {
      callWhenReady();
    }
  } else {
    // Try to connect to a locally running Ethereum node
    var providerURL = 'http://localhost:8545';
    var provider = new Web3.providers.HttpProvider(providerURL);
    // This will complain about synchronous requests on the main thread being
    // deprecated, but we don't seem to have an asynchronous replacement yet.
    if (provider.isConnected()) {
      window.web3 = new Web3(provider);
      if (callWhenReady) {
        callWhenReady();
      }
    } else {
      Shared.stopRunning('Cannot connect to the Ethereum network.');
    }
  }
};
