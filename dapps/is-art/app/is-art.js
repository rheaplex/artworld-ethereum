/*  IsArt - Ethereum contract that is or isn't art.
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

var IsArt = {};

////////////////////////////////////////////////////////////////////////////////
// Blockchain interaction
////////////////////////////////////////////////////////////////////////////////

IsArt.commitNetworkToggle = function () {
  this.contract.toggle.sendTransaction({from: Shared.selectedGasAccount()},
                                        // Callback so we're async for Metamask
                                        function (error, result) {});
};

////////////////////////////////////////////////////////////////////////////////
// Representation of the contract's state
////////////////////////////////////////////////////////////////////////////////

IsArt.setStatusRepresentation = function (status) {
  $('#is-art-status').text(Shared.bytesToString(status));
};

////////////////////////////////////////////////////////////////////////////////
// Contract manipulation GUI
////////////////////////////////////////////////////////////////////////////////

IsArt.guiDisplayHook = function () {};

////////////////////////////////////////////////////////////////////////////////
// GUI user actions
////////////////////////////////////////////////////////////////////////////////

IsArt.userSelectedUpdate = function () {
  this.commitNetworkToggle();
  Shared.showUpdating();
  Shared.hideGui();
};

IsArt.userSelectedCancel = function () {
  Shared.hideGui();
};

////////////////////////////////////////////////////////////////////////////////
// Main Program Lifecycle
////////////////////////////////////////////////////////////////////////////////

IsArt.connectToWeb3 = function () {
  if (typeof web3 !== 'undefined') {
    // Use current provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.log('No web3!');
    var provider = new Web3.providers.HttpProvider("http://localhost:8545");
    window.web3 = new Web3(provider);
  }
};

$(window).on('load', function () {
  IsArt.connectToWeb3();
  Shared.init(IsArt.guiDisplayHook);
  IsArt.contract = web3.eth.contract(contract_data.abi).at(
    contract_data.address
  );
  IsArt.filter = IsArt.contract.Status(
    {},
    function(error, result) {
      if (! error) {
        var status = result.args.is_art;
        IsArt.setStatusRepresentation(status);
        // Hide updating when tx is mined.
        // Any update will do this,
        // so it's not ideal.
        // But it's better than nothing.
        Shared.hideUpdating();
      }
    }
  );
  IsArt.contract.is_art.call(function (err, value) {
    if (! err) {
      IsArt.setStatusRepresentation(value);
    }
  });
});
