/*  IsArt - Ethereum contract that is or isn't art.
    Copyright (C) 2015, 2016  Rhea Myers <rob@Rhea Myers.org>

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

var TOGGLE_ACCOUNT_SELECTOR = '.dapp-modal-container .dapp-select-account';

var bytesToString = function (value) {
  return web3.toAscii(value).replace(/\0+$/, "");
};

if (Meteor.isClient) {

  Template.is_art.helpers({
    status: function () {
      return Session.get('status');
    }
  });

  // Keep track of when we're updating the contract state on the blockchain
  // and don't show the update dialog during that time so the user doesn't
  // waste gas trying to change it again.
  var updating = false;

  Template.is_art.events({
    'click': function(){
      if (! updating) {
        EthElements.Modal.question({
          template: 'toggle_is_art',
          data: {
            my_accounts: EthAccounts.find().fetch()
          },
          ok: function(){
            updating = true;
            var is_art = IsArt.deployed();
            // Update the state on the blockchain
            var account = TemplateVar.getFrom(TOGGLE_ACCOUNT_SELECTOR, 'value');
            is_art.toggle({ from: account }).then(function() {
              return is_art.is_art.call();
            }).then(function(value) {
              // We don't need to update the status, the event will do this
              //Session.set('status', bytesToString(value));
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
  //   IsArt.deployed here as it doesn't exist until the init code is called.
  window.onload = function() {

    EthAccounts.init();

    var is_art = IsArt.deployed();

    is_art.is_art.call().then(function(value) {
      var string_value = bytesToString(value);
      Session.setDefault('status', string_value);
    });

    is_art.Status({}, function(error, result){
      if (! error) {
        // Store the new status in local storage, updating the UI as a result
        Session.set('status', bytesToString(result.args.is_art));
      }
    });
  };
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
