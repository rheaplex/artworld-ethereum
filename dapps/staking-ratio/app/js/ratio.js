/*  Ratio - A ratio.
    Copyright (C) 2017  Rhea Myers <rob@Rhea Myers.org>

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

  var _ratio_amount = 0.83;

  var getNetworkRatioAmount = function (callback) {
    callback(_ratio_amount);
  };

  var commitNetworkRatioAmount = function (ratio) {
    _ratio_amount = ratio;
    // To be handled by value change callback
    setRatioAreaRepresentation();
  };

}

////////////////////////////////////////////////////////////////////////////////
// Globals are bad
////////////////////////////////////////////////////////////////////////////////

var gui_ratio;

////////////////////////////////////////////////////////////////////////////////
// Ratio display
////////////////////////////////////////////////////////////////////////////////

var setRatioArea = function (background_id, area_id, ratio) {
  var ratio_background = $('#' + background_id);
  var ratio_area = $('#' + area_id);
  var new_width = ratio_background.width() * ratio;
  ratio_area.width(new_width);
};

var setRatioAreaRepresentation = function () {
  getNetworkRatioAmount(function (ratio) {
    setRatioArea('ratio-background', 'ratio-area', ratio);
  });
};

var setRatioAreaGui = function (ratio) {
  setRatioArea('ratio-gui-preview-ratio-background',
               'ratio-gui-preview-ratio-area',
               ratio);
};

////////////////////////////////////////////////////////////////////////////////
// GUI
////////////////////////////////////////////////////////////////////////////////

var setSliderValue = function (ratio) {
  $('#ratio-gui-ratio').val(gui_ratio);
};

var setNumberValue = function () {
  $('#ratio-gui-ratio-value').text(gui_ratio);
};

var updateGui = function () {
  setSliderValue(gui_ratio);
  setNumberValue(gui_ratio);
  setRatioAreaGui(gui_ratio);
};

var guiDisplayHookFun = function () {
  getNetworkRatioAmount(function (ratio) {
    gui_ratio = ratio;
    updateGui();
  });
};

var numberIsValid = function (number) {
  return (number >= 0) && (number <= 1.0);
};

var sliderChanged = function () {
  gui_ratio = $('#ratio-gui-ratio').val();
  updateGui();
};

////////////////////////////////////////////////////////////////////////////////
// User actions
////////////////////////////////////////////////////////////////////////////////

var userSelectedUpdate = function () {
  commitNetworkRatioAmount(gui_ratio);
  showUpdating();
  hideGui();
};

var userSelectedCancel = function () {
  hideGui();
};

////////////////////////////////////////////////////////////////////////////////
// Lifecycle
////////////////////////////////////////////////////////////////////////////////

var init = function () {
  sharedInit(guiDisplayHookFun);
  $('#ratio-gui-ratio').on('input', sliderChanged);
  setRatioAreaRepresentation();
};

window.addEventListener('load', init, false);
