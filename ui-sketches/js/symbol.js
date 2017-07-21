/*  Symbol - A symbol.
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
// Mocking
////////////////////////////////////////////////////////////////////////////////

if (typeof web3 === 'undefined') {

  var _symbol = '☣';

  var getNetworkSymbol = function (callback) {
    callback(_symbol);
  };

  var commitNetworkSymbol = function (symbol) {
    _symbol = symbol;
    // To be handled by value change fallback
    setSymbolRepresentation(_symbol);
  };

}

////////////////////////////////////////////////////////////////////////////////
// Globals are bad
////////////////////////////////////////////////////////////////////////////////

var gui_symbol;

////////////////////////////////////////////////////////////////////////////////
// Symbol display
////////////////////////////////////////////////////////////////////////////////

var setSymbolRepresentation = function (symbol) {
  $('#symbol').text(symbol);
};

////////////////////////////////////////////////////////////////////////////////
// GUI
////////////////////////////////////////////////////////////////////////////////

var setGuiSymbol = function (symbol) {
  $('#symbol-gui-symbol').val(gui_symbol);
};

var updateGui = function () {
  setGuiSymbol(gui_symbol);
};

var guiDisplayHookFun = function () {
  gui_symbol = getNetworkSymbol(function (symbol) {
    gui_symbol = symbol;
    updateGui();
  });
};

var symbolChanged = function () {
  gui_symbol = $('#symbol-gui-symbol').val();
};

////////////////////////////////////////////////////////////////////////////////
// User actions
////////////////////////////////////////////////////////////////////////////////

// I expect this to fail for many interesting scenarios,
// e.g. modifiers of any kind.

var guiSymbolIsValid = function () {
  return (gui_symbol.length == 1) // Correct length
    && (! gui_symbol.match(/\s/)); // Not whitespace
};

var userSelectedUpdate = function () {
  if (guiSymbolIsValid()) {
    commitNetworkSymbol(gui_symbol);
    showUpdating();
    hideGui();
  } else {
    alert ('Invalid symbol. Make sure you enter a visible character in the "Symbol" field.');
  }
};

var userSelectedCancel = function () {
  hideGui();
};

////////////////////////////////////////////////////////////////////////////////
// Lifecycle
////////////////////////////////////////////////////////////////////////////////

var init = function () {
  sharedInit(guiDisplayHookFun);
  $('#symbol-gui-symbol').on('keydown', symbolChanged);
  $('#symbol-gui-symbol').on('input', symbolChanged);
  getNetworkSymbol(function (symbol) {
    setSymbolRepresentation(symbol);
  });
};

window.addEventListener('load', init, false);
