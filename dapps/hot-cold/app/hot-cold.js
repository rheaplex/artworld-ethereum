/*  HotCold - Ethereum contract of relational physical/perceptual properties.
    Copyright (C) 2015, 2016, 2017 Rob Myers <rob@robmyers.org>

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

var HotCold = {};

////////////////////////////////////////////////////////////////////////////////
// Blockchain interaction
////////////////////////////////////////////////////////////////////////////////

HotCold.commitNetworkSwap = function () {
  this.contract.swap.sendTransaction({from: Shared.selectedGasAccount()},
                                        // Callback so we're async for Metamask
                                        function (error, result) {});
};

////////////////////////////////////////////////////////////////////////////////
// Representation of the contract's state
////////////////////////////////////////////////////////////////////////////////

HotCold.updateRepresentation = function () {
  this.contract.hot.call(function (err, result) {
    if (! err) {
      $('#hot').text(Shared.bytesToString(result));
    }
  });
  this.contract.cold.call(function (err, result) {
    if (! err) {
      $('#cold').text(Shared.bytesToString(result));
    }
  });
};

////////////////////////////////////////////////////////////////////////////////
// Contract manipulation GUI
////////////////////////////////////////////////////////////////////////////////

HotCold.guiDisplayHook = function () {};

////////////////////////////////////////////////////////////////////////////////
// GUI user actions
////////////////////////////////////////////////////////////////////////////////

HotCold.userSelectedUpdate = function () {
  this.commitNetworkSwap();
  Shared.showUpdating();
  Shared.hideGui();
};

HotCold.userSelectedCancel = function () {
  Shared.hideGui();
};

////////////////////////////////////////////////////////////////////////////////
// Main Program Lifecycle
////////////////////////////////////////////////////////////////////////////////

$(window).on('load', function () {
  Shared.init(HotCold.guiDisplayHook);
  HotCold.contract = Shared.instantiateContract(contract_data);
  HotCold.filter = Shared.installFilter(HotCold.contract.Swap,
                                      {},
                                      function(result) {
                                        var status = result.args;
                                        console.log(status);
                                        HotCold.updateRepresentation();
                                        // Hide updating when tx is mined.
                                        // Any update will do this,
                                        // so it's not ideal.
                                        // But it's better than nothing.
                                        Shared.hideUpdating();
                                      });
  HotCold.updateRepresentation();
});
