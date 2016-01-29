/*  ArtIs - Ethereum contract to define art.
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

var assert = require('assert');
//var web3 = require('web3');
var Embark = require('embark-framework');
var EmbarkSpec = Embark.initTests();

// from https://github.com/ethereum/web3.js/blob/master/lib/utils/utils.js
// Until Embark's embedded web3 is upgraded
var utf8 = require('utf8');
var toUtf8 = function(hex) {
// Find termination
    var str = "";
    var i = 0, l = hex.length;
    if (hex.substring(0, 2) === '0x') {
        i = 2;
    }
    for (; i < l; i+=2) {
        var code = parseInt(hex.substr(i, 2), 16);
        if (code === 0)
            break;
        str += String.fromCharCode(code);
    }

    return utf8.decode(str);
};

describe("ArtIs", function(done) {
  before(function(done) {
    EmbarkSpec.deployAll(done);
  });

  it("make sure contract initializes correctly", function(done) {
    ArtIs.is_art(function(err, result) {
      assert.equal(toUtf8(result), "is not");
      done();
    });
  });

  it("toggle art state on", function(done) {
    ArtIs.toggle(function() {
      ArtIs.is_art(function(err, result) {
        assert.equal(toUtf8(result), "is");
        done();
      });
    });
  });

  it("toggle art state off", function(done) {
    ArtIs.toggle(function() {
      ArtIs.is_art(function(err, result) {
        assert.equal(toUtf8(result), "is not");
        done();
      });
    });
  });

  it("toggle art state on again", function(done) {
    ArtIs.toggle(function() {
      ArtIs.is_art(function(err, result) {
        assert.equal(toUtf8(result), "is");
        done();
      });
    });
  });

})
