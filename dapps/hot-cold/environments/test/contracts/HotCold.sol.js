"use strict";

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var factory = function factory(Pudding) {
  // Inherit from Pudding. The dependency on Babel sucks, but it's
  // the easiest way to extend a Babel-based class. Note that the
  // resulting .js file does not have a dependency on Babel.

  var HotCold = (function (_Pudding) {
    _inherits(HotCold, _Pudding);

    function HotCold() {
      _classCallCheck(this, HotCold);

      _get(Object.getPrototypeOf(HotCold.prototype), "constructor", this).apply(this, arguments);
    }

    return HotCold;
  })(Pudding);

  ;

  // Set up specific data for this class.
  HotCold.abi = [{ "constant": true, "inputs": [], "name": "cold", "outputs": [{ "name": "", "type": "bytes4" }], "type": "function" }, { "constant": false, "inputs": [], "name": "swap", "outputs": [], "type": "function" }, { "constant": true, "inputs": [], "name": "hot", "outputs": [{ "name": "", "type": "bytes4" }], "type": "function" }, { "inputs": [], "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "hot", "type": "bytes4" }, { "indexed": false, "name": "cold", "type": "bytes4" }], "name": "Swap", "type": "event" }];
  HotCold.binary = "60606040526000805467ffffffff00000000191667636f6c64000000001763ffffffff191663686f740017815560d890819061003a90396000f3606060405260e060020a6000350463578e9dc58114602e5780638119c065146044578063dde9c2971460c0575b005b60ce600054640100000000900460e060020a0281565b6000805463ffffffff19811660e060020a64010000000080840482028290049290921767ffffffff00000000191692810281810483029390931793849055838102606090815291909304909202608052602c917f62258dc242c94c7f047f3265c30b72955e97185dd53c59ad9c27521829ba986190604090a150565b60ce60005460e060020a0281565b6060908152602090f3";

  if ("0x2508e3b2f67a0cdef1cfd82bda72b83a28fada4b" != "") {
    HotCold.address = "0x2508e3b2f67a0cdef1cfd82bda72b83a28fada4b";

    // Backward compatibility; Deprecated.
    HotCold.deployed_address = "0x2508e3b2f67a0cdef1cfd82bda72b83a28fada4b";
  }

  HotCold.generated_with = "1.0.3";
  HotCold.contract_name = "HotCold";

  return HotCold;
};

// Nicety for Node.
factory.load = factory;

if (typeof module != "undefined") {
  module.exports = factory;
} else {
  // There will only be one version of Pudding in the browser,
  // and we can use that.
  window.HotCold = factory;
}