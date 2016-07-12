/*  DemocraticPalette - A palette that anyone can vote for the colours of.
    Copyright (C) 2016  Rhea Myers <rob@Rhea Myers.org>

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

var colour_picker;

var current_representation;

var gui_is_showing = false;

////////////////////////////////////////////////////////////////////////////////
// UI configuration, state and interaction
////////////////////////////////////////////////////////////////////////////////

var setStatus = function (message) {
  var status = document.getElementById('status');
  status.style.visibility = 'visible';
  status.innerHTML = message;
};

var makeColourPicker = function () {
  colour_picker = new ColourPicker(
    document.getElementById('change-colour-picker'),
    'images/colour-picker/');
  colour_picker.addChangeListener(function (colour) {
    // This may be triggered by a promise, and this will call a promise,
    // so delay it until the next tick (which will be after the promise
    // returns), otherwise we get this error:
    // http://bluebirdjs.com/docs/warning-explanations.html#warning-a-promise-was-created-in-a-handler-but-was-not-returned-from-it
    setTimeout(function () {
      var rgb = colour.getIntegerRGB();
      applyColourVoteCountFromState(rgb.r, rgb.g, rgb.b);
    }, 0); // 0 == as soon as possible after the current tick
  });
};

var makeAccountList = function (accounts) {
  var select = document.getElementById('change-colour-accounts');
  for (var index in accounts) {
    var account = accounts[index];
    var opt = document.createElement("option");
    opt.value = account;
    opt.innerHTML = index + ": " + account;
    select.appendChild(opt);
  }
};

var showVoteForColour = function (event, colour_index) {
  event.stopPropagation();
  if (! gui_is_showing) {
    if (colour_index == -1) {
      colour_picker.setColour(new RGBColour(255, 255, 255));
      showGui();
    } else {
      DemocraticPalette.deployed().palette.call(colour_index)
        .then(function (colour) {
          colour_picker.setColour(new RGBColour(colour[0].toNumber(),
                                                colour[1].toNumber(),
                                                colour[2].toNumber()));
          showGui();
        });
    }
  }
};

var showGui = function () {
  $('#gui').show();
  gui_is_showing = true;
};

var hideGui = function () {
  $('#gui').hide();
  gui_is_showing = false
};

var showVotingMessage = function () {
  $('#voting-in-progress').show();
};

var hideVotingMessage = function () {
  $('#voting-in-progress').hide();
};

var selectedAccount = function () {
  return $('#change-colour-accounts').val();
};

var representationElements = function () {
  return $('#' + current_representation + ' td')
}

var setElementColour = function (element, red, green, blue) {
  element.style.backgroundColor = 'rgb('
    + red.toString() + ', '
    + green.toString() + ', '
    + blue.toString() + ')';
};

var applyColourRepresentationFromState = function () {
  var palette = DemocraticPalette.deployed();
  representationElements().each(function (index, element) {
    palette.palette.call(index)
      .then (function (colour) {
        setElementColour(element, colour[0], colour[1], colour[2]);
        return null;
      });
  });
};

var setRepresentation = function (name) {
  current_representation = name;
  $('.representation').hide();
  $('#' + current_representation).show();
  applyColourRepresentationFromState();
};

var applyColourVoteCountFromState = function (r, g, b) {
  $('#').text('...');
  DemocraticPalette.deployed().voteCount.call(r, g, b)
    .then(function (count) {
      $('#selected-colour-votes').text(count.toNumber());
    });
};

////////////////////////////////////////////////////////////////////////////////
// Contract interaction
////////////////////////////////////////////////////////////////////////////////

var doVoteForColour = function () {
  var colour = colour_picker.getColour().getRGB();
  hideGui();
  showVotingMessage();
  DemocraticPalette.deployed()
    .voteFor(colour.r, colour.g, colour.b, {from: selectedAccount()})
    .catch(function(e) {
      console.log(e);
      setStatus("Error voting for colour - see log.");
    });
};

var installPaletteChangedCallback = function () {
  DemocraticPalette.deployed()
    .PaletteChanged({}, function(error, result){
      hideVotingMessage();
      if (! error) {
        // Ignore the index, just set all the colours
        applyColourRepresentationFromState();
      }
    });
};

// We can't know when transactions are mined (yet), and we don't want to
// broadcast an event every time someone votes, only when the palette changes.
// So hide the voting message after the next block so that if the vote didn't
// change the palette the message is hidden after a reasonable time anyway.
// This may mislead the user if the palette has changed but the transaction
// doesn't make it into the next block. This will best be addressed by changing
// the code when mining recepits are implemented in web3.

var installNextBlockCallback = function () {
  web3.eth.filter('latest', hideVotingMessage);
};

////////////////////////////////////////////////////////////////////////////////
// Account selection
////////////////////////////////////////////////////////////////////////////////

var setupAccounts = function () {
  web3.eth.getAccounts(function(err, accs) {
    if (err != null) {
      alert("There was an error fetching your accounts.");
      return;
    }

    if (accs.length == 0) {
      alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
      return;
    }

    makeAccountList(accs);
  });
};

////////////////////////////////////////////////////////////////////////////////
// Go!
////////////////////////////////////////////////////////////////////////////////

window.onload = function() {
  hideGui();
  hideVotingMessage();
  makeColourPicker();
  setupAccounts();
  setRepresentation('stripes');
  installPaletteChangedCallback();
  installNextBlockCallback();
  applyColourRepresentationFromState();
};
