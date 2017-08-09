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

const Shared = {};

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

Shared.setGasAccountChangedCallback = function (callback, callOnCreation) {
  this.gas_account_changed_callback = callback;
  this.gas_account_changed_callback_call_on_creation = callOnCreation;
};

Shared.selectedGasAccount = function () {
  return $('#gui-gas-account').val();
};

Shared.makeGasAccountList = function (accounts) {
  const select = $('#gui-gas-account');
  select.find('option').remove();
  for (let index in accounts) {
    const account = accounts[index];
    select.append($("<option></option>")
                  .attr("value", account)
                  .text(index + ": " + account));
  }
  if (this.gas_account_changed_callback) {
    select.change(this.gas_account_changed_callback);
  }
  if (this.gas_account_changed_callback_call_on_creation) {
    this.gas_account_changed_callback();
  }
};

Shared.setupGasAccounts = function (callback) {
  web3.eth.getAccounts((err, accs) => {
    // Catastrophe. There is no web3 (so why didn't we stop earlier?)
    if (err != null) {
      this.stopRunning("There was an error fetching your accounts.");
      return;
    }
    // Warning. No accounts have been enabled, but there's probably a web3
    if (accs.length == 0) {
      this.hideGui();
      alert("Couldn't access any accounts!");
      return;
    }
    this.makeGasAccountList(accs);
    callback();
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
    this.setupGasAccounts(() => {
      $('.gui').show();
      this.gui_is_showing = true;
      if (this.gui_display_hook !== false) {
        this.gui_display_hook();
      }
    });
  }
};

Shared.hideGui = function () {
  $('.gui').hide();
  this.gui_is_showing = false;
};

Shared.showUpdating = function (message) {
  $('#updating').html(message || 'Updating&hellip;');
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
  // Disable clicking to display the gui
  $('#background').prop('onclick', null);
  this.hideUpdating();
  this.hideGui();
  $('#representation').hide();
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
    this.stopRunning('Cannot connect to the Ethereum network.');
  }
};
