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

IsArt.guiDisplayHook = function () {
  $('#myInputID').focus();
};

////////////////////////////////////////////////////////////////////////////////
// GUI user actions
////////////////////////////////////////////////////////////////////////////////

IsArt.userSelectedUpdate = function () {
  event.stopPropagation();
  this.commitNetworkToggle();
  Shared.showUpdating();
  Shared.hideGui();
};

IsArt.userSelectedCancel = function () {
  event.stopPropagation();
  Shared.hideGui();
};

////////////////////////////////////////////////////////////////////////////////
// Main Program Lifecycle
////////////////////////////////////////////////////////////////////////////////

$(window).on('load', function () {
  Shared.init(IsArt.guiDisplayHook, function () {
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
    Shared.showRepresentation();
    $('.gui-container').click(function(event) {
      event.stopPropagation();
      Shared.showGui(event, -1);
    });
    IsArt.contract.is_art.call(function (err, value) {
      if (! err) {
        IsArt.setStatusRepresentation(value);
      }
    });
  });
});
