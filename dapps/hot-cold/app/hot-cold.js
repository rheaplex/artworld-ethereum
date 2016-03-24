/*  HotCold - Ethereum contract of relational physical/perceptual properties.
    Copyright (C) 2015, 2016  Rob Myers <rob@robmyers.org>

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

var SWAP_ACCOUNT_SELECTOR = '.dapp-modal-container .dapp-select-account';

var bytesToString = function (value) {
  return web3.toAscii(value).replace(/\0+$/, "");
};

if (Meteor.isClient) {

  Template.hot_cold.helpers({
    hot: function () {
      return Session.get('hot');
    },
    cold: function () {
      return Session.get('cold');
    }
  });

  // Keep track of when we're updating the contract state on the blockchain
  // and don't show the update dialog during that time so the user doesn't
  // waste gas trying to change it again.
  var updating = false;

  Template.hot_cold.events({
    'click': function(){
      if (! updating) {
        EthElements.Modal.question({
          template: 'swap_hot_cold',
          data: {
            my_accounts: EthAccounts.find().fetch()
          },
          ok: function(){
            updating = true;
            var hot_cold = HotCold.deployed();
            // Update the state on the blockchain
            var account = TemplateVar.getFrom(SWAP_ACCOUNT_SELECTOR, 'value');
            hot_cold.swap({ from: account }).then(function(value) {
              updating = false;
            }).catch(function(e) {
              console.log(e);
              alert("Error sending toggling; see log.");
            });
          },
          cancel: true
        });
      }
    }
  });

  // Why do we put this inside window.onload?
  // Truffle adds init code *after* this file is inlined, so we can't access
  //   HotCold.deployed here as it doesn't exist until the init code is called.
  window.onload = function() {

    EthAccounts.init();

    var hot_cold = HotCold.deployed();

    hot_cold.hot.call().then(function(value) {
      var string_value = bytesToString(value);
      Session.setDefault('hot', string_value);
    });

    hot_cold.cold.call().then(function(value) {
      var string_value = bytesToString(value);
      Session.setDefault('cold', string_value);
    });

    hot_cold.Swap({}, function(error, result){
      if (! error) {
        // Store the new state in local storage, updating the UI as a result
        // Session.set('hot', bytesToString(result.args.hot));
        // Session.set('hot', bytesToString(result.args.cold));
        // BUT events with more than one value are borked in webthree.js atm
        hot_cold.hot.call().then(function(value) {
          var string_value = bytesToString(value);
          Session.set('hot', string_value);
        });

        hot_cold.cold.call().then(function(value) {
          var string_value = bytesToString(value);
          Session.set('cold', string_value);
        });
      }
    });
  };
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
