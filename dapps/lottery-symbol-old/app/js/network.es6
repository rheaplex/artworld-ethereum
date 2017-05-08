/*  A symbol.
    Copyright (C) 2016, 2017  Rob Myers <rob@robmyers.org>

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

'use strict';

////////////////////////////////////////////////////////////////////////////////
// Web3 or Mock
////////////////////////////////////////////////////////////////////////////////

if (typeof web3 !== 'undefined') {

  var Web3 = require("web3");

  window.addEventListener('load', function() {
    if (typeof web3 !== 'undefined') {
      window.web3 = new Web3(web3.currentProv ider);
    } else {
      alert('No Web3 found. Please open in an Ethereum waller. ');
    }
  });

} else {

  var _symbol = '☣';

  var getNetworkSymbol = function (callback) {
    callback(_symbol);
  };

  var commitNetworkSymbol = function (symbol) {
    _symbol = symbol;
    // To be handled by value change fallback
    setSymbolRepresentation(_symbol);
  };

}
