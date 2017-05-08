/*  shared-mock.js - Support code for non-blockchain GUI testing.
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

var EtherShared = {};

////////////////////////////////////////////////////////////////////////////////
// Globals are bad
////////////////////////////////////////////////////////////////////////////////

// var web3;

EtherShared.gui_is_showing = false;

EtherShared.state_is_updating = false;

EtherShared.gui_display_hook = false;

////////////////////////////////////////////////////////////////////////////////
// Event type conversion
////////////////////////////////////////////////////////////////////////////////

EtherShared.bytesToString = function (value) {
  return web3.toAscii(value).replace(/\0+$/, "");
};

////////////////////////////////////////////////////////////////////////////////
// Web3
////////////////////////////////////////////////////////////////////////////////

EtherShared.connectToWeb3 = function () {
  if (typeof web3 !== 'undefined') {
    // Use current provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.log('No web3!');
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }
};

var numToObject;
var colourToObjects;

var _initWeb3Utilities = function () {
  if (typeof web3 === 'undefined') {

    numToObject = function (num) {
      var str = num.toString();
      return {'toNumber': function () { return num; },
              'toString': function () { return str; }};
    };

    colourToObjects = function (col) {
      return [numToObject(col[0]),
              numToObject(col[1]),
              numToObject(col[2])];
    };

  }
};

// OVERRIDE

Share.setupGasAccounts = function () {
      makeGasAccountList(['0x997890bc85c5796408ceb20b0ca75dabe6fe868136e926d24ad0f36aa424f99d', '1d7a363ce12430881ec56c9cf1409c49c491043618e598c356e2959040872f5a', '61b1946176b6d6031da0cac42e0f359e77e47c121de491809bb2bc6cc53c8564', 'd3eb539a556352f3f47881d71fb0e5777b2f3e9a4251d283c18c67ce996774b7']);
    };

////////////////////////////////////////////////////////////////////////////////
// Callbacks
////////////////////////////////////////////////////////////////////////////////


var _blockFilters = [];

var installLatestBlockFilter = function (callback) {
  _blockFilters.push(callback);
};

var _nextBlock = function () {
  _blockFilters.forEach(function(callback) { callback(false, {}); });
};

setInterval(_nextBlock, 12000);

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
  $('#status').text(message).show();
};

var stopRunning = function (message) {
  $('#representation').hide();
  // Disable clicking to show the gui
  $('#background').prop('onclick',null);
  hideUpdating();
  hideGui();
  setStatus(message);
};

////////////////////////////////////////////////////////////////////////////////
// Shared setup
////////////////////////////////////////////////////////////////////////////////

//installLatestBlockFilter(hideUpdating);
