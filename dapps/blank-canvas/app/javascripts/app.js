/*  BlankCanvas - A blank canvas anyone can set the colour of.
    Copyright (C) 2016  Rob Myers <rob@robmyers.org>

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

////////////////////////////////////////////////////////////////////////////////
// UI configuration, state and interaction
////////////////////////////////////////////////////////////////////////////////

function setStatus(message) {
  var status = document.getElementById("status");
  status.style.visibility = 'visible';
  status.innerHTML = message;
};

var makeColourPicker = function () {
  colour_picker = new ColourPicker(
    document.getElementById('change-colour-picker'),
    'images/colour-picker/');
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

var setCanvasColour = function (red, green, blue) {
  document.getElementById('canvas').style.backgroundColor = 'rgb('
      + red.toString() + ', '
      + green.toString() + ', '
      + blue.toString() + ')';
};

var showChangeColour = function () {
  // The user may have cancelled last time, or the contract may have changed
  // so get the colour to show each time.
  BlankCanvas.deployed()
    .getColour.call()
    .then(function (rgb) {
      colour_picker.setColour(new RGBColour(rgb[0].toNumber(),
                                            rgb[1].toNumber(),
                                            rgb[2].toNumber()));
      document.getElementById("change-colour").style.visibility = 'visible';
    });
};

var hideChangeColour = function () {
  document.getElementById("change-colour").style.visibility = 'hidden';
};

var showChangingMessage = function () {
  document.getElementById("changing").style.visibility = 'visible';
};

var hideChangingMessage = function () {
  document.getElementById("changing").style.visibility = 'hidden';
};

var selectedAccount = function () {
  return document.getElementById('change-colour-accounts').value;
};

////////////////////////////////////////////////////////////////////////////////
// Contract interaction
////////////////////////////////////////////////////////////////////////////////

var doChangeColour = function () {
  var colour = colour_picker.getColour().getRGB();
  hideChangeColour();
  showChangingMessage();
  BlankCanvas.deployed()
    .setColour(colour.r, colour.g, colour.b, {from: selectedAccount()})
    .catch(function(e) {
      console.log(e);
      setStatus("Error changing colour - see log.");
    });
};

var setCanvasColourFromState = function () {
  BlankCanvas.deployed()
    .getColour.call()
    .then(function (rgb) {
      setCanvasColour(rgb[0].toNumber(),
                      rgb[1].toNumber(),
                      rgb[2].toNumber());
    });
};

var installColourChangedCallback = function () {
  BlankCanvas.deployed()
    .ColourChanged({}, function(error, result){
      hideChangingMessage();
      if (! error) {
        setCanvasColour(result.args.red.toNumber(),
                        result.args.green.toNumber(),
                        result.args.blue.toNumber());
      }
    });
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
  makeColourPicker();
  setupAccounts();
  installColourChangedCallback();
  setCanvasColourFromState();
};
