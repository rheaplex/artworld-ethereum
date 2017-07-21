/*  shared.js - Support code.
    Copyright (C) 2016, 2017  Rhea Myers <rhea@myers.studio>

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
// Globals are bad
////////////////////////////////////////////////////////////////////////////////

var gui_is_showing = false;

var state_is_updating = false;

var gui_display_hook = false;

////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////


if (typeof web3 === 'undefined') {

  var numToObject = function (num) {
    var str = num.toString();
    return {'toNumber': function () { return num; },
            'toString': function () { return str; }};
  };

  var colourToObjects = function (col) {
    return [numToObject(col[0]),
            numToObject(col[1]),
            numToObject(col[2])];
  };

}


////////////////////////////////////////////////////////////////////////////////
// Accounts
////////////////////////////////////////////////////////////////////////////////

var selectedGasAccount = function () {
  return elementById('gui-gas-account').val();
};

var makeGasAccountList = function (accounts) {
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

if (typeof web3 === 'undefined') {

  var setupGasAccounts = function () {
    makeGasAccountList(['0x997890bc85c5796408ceb20b0ca75dabe6fe868136e926d24ad0f36aa424f99d', '1d7a363ce12430881ec56c9cf1409c49c491043618e598c356e2959040872f5a', '61b1946176b6d6031da0cac42e0f359e77e47c121de491809bb2bc6cc53c8564', 'd3eb539a556352f3f47881d71fb0e5777b2f3e9a4251d283c18c67ce996774b7']);
  };

} else {

  var setupGasAccounts = function () {
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      makeGasAccountList(accs);
    });
  };

}

////////////////////////////////////////////////////////////////////////////////
// Callbacks
////////////////////////////////////////////////////////////////////////////////

if (typeof web3 === 'undefined') {

  var _blockFilters = [];

  var installLatestBlockFilter = function (callback) {
    _blockFilters.push(callback);
  };

  var _nextBlock = function () {
    _blockFilters.forEach(function(callback) { callback(false, {}); });
  };

  setInterval(_nextBlock, 12000);

} else {

  var installLatestBlockFilter = function (callback) {
    web3.eth.filter('latest', callback);
  };

}

////////////////////////////////////////////////////////////////////////////////
// UI configuration, state and interaction
////////////////////////////////////////////////////////////////////////////////

var showGui = function () {
  if (! state_is_updating) {
    // Showing newly added account is better than keeping previous selection
    setupGasAccounts();
    $('.gui').show();
    gui_is_showing = true;
    if (gui_display_hook !== false) {
      gui_display_hook();
    }
  }
};

var hideGui = function () {
  $('.gui').hide();
  gui_is_showing = false
};

var showUpdating = function () {
  $('#updating').show();
  state_is_updating = true;
};

var hideUpdating = function () {
  $('#updating').hide();
  state_is_updating = false
};

var setStatus = function (message) {
  $('#status').show().innerHTML = message;
};

////////////////////////////////////////////////////////////////////////////////
// Shared setup
////////////////////////////////////////////////////////////////////////////////

var sharedInit = function (_gui_display_hook) {
  if (_gui_display_hook) {
    gui_display_hook = _gui_display_hook;
  }
  hideGui();
  hideUpdating();
  $('#status').hide();
  // We can't know when transactions are mined (yet), and we don't want to
  // broadcast an event every time someone votes, only when the palette changes.
  // So hide the voting message after the next block so that if the vote didn't
  // change the palette the message is hidden after a reasonable time anyway.
  // This may mislead the user if the palette has changed but the transaction
  // doesn't make it into the next block. This will best be addressed by
  // changing the code when mining receipts are implemented in web3.
  installLatestBlockFilter(hideUpdating);
};
