/*  IsArt - Ethereum contract that is or isn't art.
    Copyright (C) 2015  Rhea Myers <rob@Rhea Myers.org>

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

if (Meteor.isClient) {

  Session.setDefault('status', web3.toAscii(IsArt.is_art()));

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
          text: "Toggle the contract's state (costs gas!)",
          ok: function(){
            updating = true;
            // Update the state on the blockchain
            IsArt.toggle();
          },
          cancel: true
        });
      }
    }
  });

  var event = IsArt.Status();
  event.watch(function(error, result){
    if (! error) {
      // Store the new status in local storage, updating the UI as a result
      Session.set('status', web3.toAscii(result.args.is_art));
      // The blockchain updated, so re-enable toggling.
      // (This may unlock when *someone else's* update comes through. We could
      //  tackle this by sending account and nonce then watching for it in the
      //  event, but not enough people will hit the button to make that
      //  worthwhile.)
      updating = false;
    }
  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
