/*  Bitmap - A bitmap.
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


if (typeof web3 === 'undefined') {

  var _pixelValues = '1000000000000001000000000000010000000000000000000000000000000110000000100000000000000000100000100000000001000000000000000000000000000000000000000000000000000000000011100000000000000000000000000000111110000000000000000000000000000000000000101000000000000111'.split('');

  var getNetworkPixelValues = function (callback) {
    callback(_pixelValues);
  };

  var commitNetworkPixelValues = function (newPixels) {
    _pixelValues = newPixels;
  };

}

var pixelValues;

var symbol = '☣';

var indexForCoords = function (x, y) {
    return (y * 16) + x;
};

var drawPixels = function (pixels, ctx, shapeFun, cellSize, on, off) {
  for (var y = 0; y < 16; y++) {
    for (var x = 0; x < 16; x++) {
      var value = pixels[indexForCoords(x, y)];
      if (value == '1') {
        ctx.fillStyle = on;
      } else {
        ctx.fillStyle = off;
      }
      var h = x * cellSize;
      var v = y * cellSize;
      shapeFun(ctx, h, v, cellSize);
    }
  }
};

var drawRect = function (ctx, h, v, cellSize) {
  ctx.beginPath();
  ctx.rect(h, v, h + cellSize, v + cellSize);
  ctx.fill();
};

var drawCircle = function (ctx, h, v, cellSize) {
  var radius = cellSize / 2;
  ctx.beginPath();
  ctx.arc(h + radius, v + radius, radius, 0, 2 * Math.PI, false);
  ctx.fill();
};

var drawSymbol = function (ctx, h, v, cellSize) {
  ctx.font = "" + cellSize + "px sans";
  ctx.fillText(symbol, h, v + cellSize);
};

var drawPixelsRepresentation = function () {
  var canvas = $("#bitmap").get(0);
  var ctx = canvas.getContext("2d");
  canvas.width  = 1600;
  canvas.height = 1600;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  drawPixels(pixelValues, ctx, drawSymbol, canvas.width / 16, 'black', 'white');
};

var guiPixelValues;

var guiClickHandler = function (i) {
  return function () {
    if (guiPixelValues[i] == "1") {
      guiPixelValues[i] = "0";
    } else {
      guiPixelValues[i] = "1";
    }
    setGuiBitmapState();
  };
};

var createGuiBitmap = function () {
  var bitmap = $("#bitmap-gui-bitmap");
  for (var i = 0; i < 256; i++) {
    var id = "gui-pixel-" + i;
    pixel = $('<div id="'
              + id
              + '" class="bitmap-gui-pixel"></div>');
    bitmap.append(pixel);
    pixel.on('click', guiClickHandler(i));
  }
};

var setGuiBitmapState = function () {
  var bitmap = $("#bitmap-gui-bitmap")[0];
  for (var i = 0; i < 256; i++) {
    var pixel = $("#gui-pixel-" + i);
    if (guiPixelValues[i] == "1") {
      pixel.addClass("bitmap-gui-pixel-on");
    } else {
      pixel.removeClass("bitmap-gui-pixel-on");
    }
  }
};

var guiDisplayHookFun = function () {
  getNetworkPixelValues(function (pixels) {
      guiPixelValues = pixels;
      setGuiBitmapState();
  });
};

window.onload = function () {
  sharedInit(guiDisplayHookFun);
  createGuiBitmap();
  getNetworkPixelValues(function (pixels) {
    pixelValues = pixels;
    drawPixelsRepresentation();
  });
};
