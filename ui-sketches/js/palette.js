/*  DemocraticPalette - A palette that anyone can vote for the colours of.
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

  var _palette = [[0, 0, 255], [255, 0, 0], [0, 255, 255],
                  [0, 128, 0], [96, 255, 0], [0, 0, 96],
                  [0, 96, 0], [32, 255, 0], [128, 255, 128],
                  [0, 255, 0], [128, 255, 0], [255, 0, 128]];

  var _voteIndex = 0;

  var getNetworkPaletteIndex = function (index, callback) {
    var colour = colourToObjects(_palette[index]);
    callback(colour);
  };

  var _count = numToObject(42);

  var applyColourRepresentationFromState = function () {
    applyToRepresentationElements(function (index, element) {
      var colour = _palette[index];
      setElementColour(element, colour[0], colour[1], colour[2]);
    });
  };

  var getNetworkVoteCount = function (r, g, b, callback) {
    // Everything has the same count.
    callback(_count);
  };

  var installPaletteChangedCallback = function (callback) {
    // This is an obvious hack. But we have a similar signature to the block
    // callback so it works OK.
    installLatestBlockFilter(callback);
  };

  // No callback. We update in our palette state change callback.

  var updateNetworkVoteCount = function (r, g, b) {
    // Just step through the palette. Real behaviour isn't like this at all.
    _palette[(_voteIndex ++) % _palette.length] = [r, g, b];
  };

} else {

  var getNetworkPaletteIndex = function (index, callback) {
    DemocraticPalette.deployed().palette.call(index)
      .then(callback);
  };

  var getNetworkVoteCount = function (r, g, b, callback) {
    DemocraticPalette.deployed().voteCount.call(r, g, b)
      .then(callback(count));
  };

  // No callback. We update in our palette state change callback.

  var updateNetworkVoteCount = function (r, g, b) {
    DemocraticPalette.deployed()
      .voteFor(r, g, b, {from: selectedGasAccount()})
      .catch(function(e) {
        console.log(e);
        setStatus("Error voting for colour - see log.");
      });
  };

  var installPaletteChangedCallback = function (callback) {
    DemocraticPalette.deployed()
      .PaletteChanged({}, callback);
  };

}

////////////////////////////////////////////////////////////////////////////////
// Globals are bad
////////////////////////////////////////////////////////////////////////////////

var colour_picker;

var current_representation;

var gui_is_showing = false;

////////////////////////////////////////////////////////////////////////////////
// Representation
////////////////////////////////////////////////////////////////////////////////

var applyToRepresentationElements = function (callback) {
  var tds = document.querySelectorAll('#' + current_representation + ' td');
  for(i = 0; i < tds.length; ++i) {
    callback(i, tds[i]);
  }
};

var applyColourRepresentationFromState = function () {
  applyToRepresentationElements(function (index, element) {
    getNetworkPaletteIndex(index, function (colour) {
      setElementColour(element, colour[0], colour[1], colour[2]);
    });
  });
};

var applyColourVoteCountFromState = function (r, g, b) {
  getNetworkVoteCount(r, g, b, function (count) {
    $('#selected-colour-votes').html(count.toNumber());
  });
};

////////////////////////////////////////////////////////////////////////////////
// UI configuration, state and interaction
////////////////////////////////////////////////////////////////////////////////

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

// We don't use the showGui callback as we need to call it in a callback in one
// path.

var showVoteForColour = function (event, colour_index) {
  event.stopPropagation();
  if (! gui_is_showing) {
    if (colour_index == -1) {
      colour_picker.setColour(new RGBColour(255, 255, 255));
      showGui();
    } else {
      getNetworkPaletteIndex(colour_index,
                            function (colour) {
                              colour_picker
                                .setColour(new RGBColour(colour[0].toNumber(),
                                                         colour[1].toNumber(),
                                                         colour[2].toNumber()));
                              showGui();
                            });
    }
  }
};

var setElementColour = function (element, red, green, blue) {
  element.style.backgroundColor = 'rgb('
    + red.toString() + ', '
    + green.toString() + ', '
    + blue.toString() + ')';
};

var setRepresentation = function (name) {
  current_representation = name;
  $('.representation').hide();
  $('#' + current_representation).show();
  applyColourRepresentationFromState();
};

var doVoteForColour = function () {
  var colour = colour_picker.getColour().getRGB();
  hideGui();
  showUpdating();
  updateNetworkVoteCount(Math.round(colour.r),
                         Math.round(colour.g),
                         Math.round(colour.b));
};

var paletteChangedCallback = function(error, result){
  hideUpdating();
  if (! error) {
    // Ignore the index, just set all the colours
    applyColourRepresentationFromState();
  }
};

////////////////////////////////////////////////////////////////////////////////
// Go!
////////////////////////////////////////////////////////////////////////////////

window.onload = function() {
  sharedInit();
  makeColourPicker();
  setRepresentation('stripes');
  installPaletteChangedCallback(paletteChangedCallback);
  applyColourRepresentationFromState();
};
