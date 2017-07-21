/*  Stroke - Line stroke properties.
    Copyright (C) 2017  Rhea Myers <rhea@myers.studio>

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
  var _strokeWidth = 10;
  var _strokeLinecap = 1;
  var _strokeDasharray = '50, 50';

  var getNetworkStrokeWidth = function (callback) {
    callback(_strokeWidth);
  };

  var getNetworkStrokeLinecap = function (callback) {
    callback(_strokeLinecap);
  };

  var getNetworkStrokeDasharray = function (callback) {
    callback(_strokeDasharray);
  };

  var commitNetworkStroke = function (width, linecap, dasharray) {
    _strokeWidth = width;
    _strokeLinecap = linecap;
    _strokeDasharray = dasharray;
    setStyleRepresentation(_strokeWidth, _strokeLinecap, _strokeDasharray);
  }

}

////////////////////////////////////////////////////////////////////////////////
// Globals are bad
////////////////////////////////////////////////////////////////////////////////

var guiStrokeDisplayWidth = 10;
var guiStrokeDisplayLinecap = 1;
var guiStrokeDisplayDasharray = '50,50';

var lineCaps = ['butt', 'round', 'square'];

////////////////////////////////////////////////////////////////////////////////
// Stroke display
////////////////////////////////////////////////////////////////////////////////

var getNetworkStrokeStyle = function (callback) {
  getNetworkStrokeWidth(function (width) {
    guiStrokeDisplayWidth = width;
    getNetworkStrokeLinecap(function (cap) {
      guiStrokeDisplayLinecap = cap;
      getNetworkStrokeDasharray(function (dashes) {
        guiStrokeDasharray = dashes;
        if (callback) {
          callback(guiStrokeDisplayWidth,
                   guiStrokeDisplayLinecap,
                   guiStrokeDasharray);
        }
      });
    });
  });
};

var setStyle = function (id, width, linecap, dasharray) {
  var applicant = $('#' + id);
  applicant.css('stroke-width', width + 'pt');
  applicant.css('stroke-linecap', lineCaps[linecap]);
  applicant.css('stroke-dasharray', dasharray);
};

var setStyleRepresentation = function (width, linecap, dasharray) {
  setStyle('stroke', width, linecap, dasharray);
};

var setStyleGui = function (width, linecap, dasharray) {
  setStyle('stroke-gui-preview-stroke', width, linecap, dasharray);
};

////////////////////////////////////////////////////////////////////////////////
// GUI
////////////////////////////////////////////////////////////////////////////////

var setGuiWidth = function (width) {
  $('#stroke-gui-width').val(width);
  $('#stroke-gui-width-value').text(width);
};

var setGuiLinecap = function (cap) {
  $('#stroke-gui-linecap').val(cap);
};

var setGuiDasharray = function (dasharray) {
  $('#stroke-gui-dasharray').val(dasharray);
};

var updateGui = function () {
  setStyleGui(guiStrokeDisplayWidth,
              guiStrokeDisplayLinecap,
              guiStrokeDisplayDasharray);
  setGuiWidth(guiStrokeDisplayWidth);
  setGuiLinecap(guiStrokeDisplayLinecap)
  setGuiDasharray(guiStrokeDisplayDasharray);
};

var guiDisplayHookFun = function () {
  getNetworkStrokeStyle(updateGui);
};

var widthChanged = function () {
  guiStrokeDisplayWidth = $('#stroke-gui-width').val();
  updateGui();
};

var linecapChanged = function () {
  guiStrokeDisplayLinecap = $('#stroke-gui-linecap').val();
  updateGui();
};

var dasharrayChanged = function () {
  var dash = $('#stroke-gui-dasharray');
  dash.val(dash.val().replace(/[^0-9,]/g, ''));
  guiStrokeDisplayDasharray = dash.val();
  updateGui();
};

////////////////////////////////////////////////////////////////////////////////
// User actions
////////////////////////////////////////////////////////////////////////////////

var userSelectedUpdate = function () {
  commitNetworkStroke(guiStrokeDisplayWidth,
                      guiStrokeDisplayLinecap,
                      guiStrokeDisplayDasharray);
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
  $('#stroke-gui-width').on('input', widthChanged);
  $('#stroke-gui-linecap').on('input', linecapChanged);
  $('#stroke-gui-dasharray').on('keydown', dasharrayChanged);
  $('#stroke-gui-dasharray').on('input', dasharrayChanged);
  getNetworkStrokeStyle(setStyleRepresentation);
};

window.addEventListener('load', init, false);
