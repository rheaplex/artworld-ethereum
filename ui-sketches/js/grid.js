/*  Grid - A grid.
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

/*var rows = [0, 10, 100, 10, 20];
var columns = [10, 20, 30, 50];

var totalWidth = function (array) {
  return array.reduce(function(a, b) { return a + b; });
};

var widthsNormalisedScale = function (array) {
  return 1.0 / totalWidth(array);
};

var widthsToNormalisedUnits = function (array) {
  var scale = widthsNormalisedScale(array);
  return array.map(function (x) { return x * scale; });
};

var widthsToPixels = function (array, width) {
  return widthsToNormalisedUnits(array)
    .map(function (x) { return x * width});
};

var drawGrid = function (widths, heights, ctx) {
  var width = ctx.canvas.width;
  var height = ctx.canvas.height;
  var xs = widthsToPixels(widths, width);
  var ys = widthsToPixels(heights, height);
  var x = 0;
  var y = 0;
  xs.forEach(function (xd) {
    x += xd;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  });
  ys.forEach(function (yd) {
    y += yd;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  });
};*/

////////////////////////////////////////////////////////////////////////////////
// Mocking
////////////////////////////////////////////////////////////////////////////////

if (typeof web3 === 'undefined') {
  var _rows = [1, 10, 20, 30, 60, 100];
  var _columns = [7, 9, 12, 20, 30, 98];

  var getNetworkRows = function (callback) {
    callback(_rows);
  };

  var getNetworkColumns = function (callback) {
    callback(_columns);
  };

  var commitNetworkGrid = function (new_rows, new_columns) {
    _rows = new_rows;
    _columns = new_columns;
  };

}

////////////////////////////////////////////////////////////////////////////////
// Globals are bad
////////////////////////////////////////////////////////////////////////////////

var gui_rows = [1, 10, 20, 30, 60, 100];
var gui_columns = [7, 9, 12, 20, 30, 98];

////////////////////////////////////////////////////////////////////////////////
// Grid Specification wrangling
////////////////////////////////////////////////////////////////////////////////

// This is different from the validation we use in the GUI, which is bad,
// so make sure there are no surprises.

// Also notice we sort.

var stringToPositions = function (string) {
  return string.split(',')
    .map(function (x) { return parseInt(x, 10); })
    .filter( function (x) { return (! isNaN(x)) && (x >= 1) && (x <= 100); })
    .sort(function (a, b) { return a - b; });
};

var positionsToString = function (array) {
  return array.join(',');
};

////////////////////////////////////////////////////////////////////////////////
// Grid display
////////////////////////////////////////////////////////////////////////////////

var drawGrid = function (widths, heights, ctx) {
  var width = ctx.canvas.width;
  var height = ctx.canvas.height;
  var xscale = width / 100;
  var yscale = height / 100;
  var offset = ctx.lineWidth / 2;
  widths.forEach(function (x) {
    var h = (x * xscale) - offset;
    ctx.beginPath();
    ctx.moveTo(h, 0);
    ctx.lineTo(h, height);
    ctx.stroke();
  });
  heights.forEach(function (y) {
    var v = (y * yscale) - offset;
    ctx.beginPath();
    ctx.moveTo(0, v);
    ctx.lineTo(width, v);
    ctx.stroke();
  });
};

var drawGridRepresentation = function () {
  var canvas = $("#grid").get(0);
  var ctx = canvas.getContext("2d");
  canvas.width  = 1600;
  canvas.height = 1600;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.strokeStyle = 'red';
  ctx.lineWidth = Math.min(ctx.canvas.width, ctx.canvas.height) / 100;
  getNetworkRows(function (rows) {
    getNetworkColumns(function (columns) {
      drawGrid(rows, columns, ctx);
    });
  });
};

var drawGridGui = function () {
  var canvas = $("#gui-grid-preview").get(0);
  var ctx = canvas.getContext("2d");
  canvas.width  = 100;
  canvas.height = 100;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 1.2;
  drawGrid(getGuiRows(), getGuiColumns(), ctx);
};

////////////////////////////////////////////////////////////////////////////////
// GUI
////////////////////////////////////////////////////////////////////////////////

var getGuiRows = function () {
  return stringToPositions($('#grid-gui-rows').val());
};

var getGuiColumns = function () {
  return stringToPositions($('#grid-gui-columns').val());
};

// Today I will be thinking mostly in regexes

var guiWidthsFilter = function (widths, event) {
  // Collapse multiple commas to single commas
  widths.val(widths.val().replace(/,+/g, ','));
  // 44 == ASCII comma
  if (event.which != 44) {
    // Strip out everything except numbers and commas
    widths.val(widths.val().replace(/[^\d,]/g, ''));
    // No numbers longer than three digits
    widths.val(widths.val().replace(/(\d{1,3})[^,]*(,|$)/g, '$1$2'));
    // The lowest number is one
    widths.val(widths.val().replace(/(^|,)0(,|$)/g, '$11$2'));
    // The highest digit is 100
    widths.val(widths.val().replace(/\d{3}(,|$)/g, '100$1'));
  }
};

var guiRowsChanged = function (event) {
  var rows = $('#grid-gui-rows');
  guiWidthsFilter(rows, event);
  drawGridGui();
};

var guiColumnsChanged = function () {
  var columns = $('#grid-gui-columns');
  guiWidthsFilter(columns, event);
  drawGridGui();
};

var guiDisplayHookFun = function () {
  getNetworkRows(function (rows) {
    $('#grid-gui-rows').val(positionsToString(rows));
    getNetworkColumns(function (columns) {
      $('#grid-gui-columns').val(positionsToString(columns));
      drawGridGui();
    });
  });
};

////////////////////////////////////////////////////////////////////////////////
// User actions
////////////////////////////////////////////////////////////////////////////////

var userSelectedUpdate = function () {
  commitNetworkGrid(getGuiRows(), getGuiColumns());
  showUpdating();
  hideGui();
  drawGridRepresentation();
};

var userSelectedCancel = function () {
  hideGui();
};

////////////////////////////////////////////////////////////////////////////////
// Lifecycle
////////////////////////////////////////////////////////////////////////////////

var init = function () {
  sharedInit(guiDisplayHookFun);
  $('#grid-gui-rows').keydown(guiRowsChanged);
  $('#grid-gui-rows').on('input', guiRowsChanged);
  $('#grid-gui-columns').keydown(guiColumnsChanged);
  $('#grid-gui-columns').on('input', guiColumnsChanged);
  drawGridRepresentation();
};

window.addEventListener('load', init, false);
