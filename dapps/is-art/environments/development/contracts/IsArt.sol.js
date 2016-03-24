"use strict";

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var factory = function factory(Pudding) {
  // Inherit from Pudding. The dependency on Babel sucks, but it's
  // the easiest way to extend a Babel-based class. Note that the
  // resulting .js file does not have a dependency on Babel.

  var IsArt = (function (_Pudding) {
    _inherits(IsArt, _Pudding);

    function IsArt() {
      _classCallCheck(this, IsArt);

      _get(Object.getPrototypeOf(IsArt.prototype), "constructor", this).apply(this, arguments);
    }

    return IsArt;
  })(Pudding);

  ;

  // Set up specific data for this class.
  IsArt.abi = [{ "constant": true, "inputs": [], "name": "is_art", "outputs": [{ "name": "", "type": "bytes7" }], "type": "function" }, { "constant": false, "inputs": [], "name": "toggle", "outputs": [], "type": "function" }, { "inputs": [], "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "is_art", "type": "bytes7" }], "name": "Status", "type": "event" }];
  IsArt.binary = "606060405260008054666973206e6f740066ffffffffffffff1990911617905560dd8061002c6000396000f3606060405260e060020a600035046316f5066a8114602457806340a3d246146032575b005b608160005460c860020a0281565b60005460229060c860020a027f69730000000000000000000000000000000000000000000000000000000000001415608b576000805466ffffffffffffff1916666973206e6f740017905560a7565b6060908152602090f35b60008054666973000000000066ffffffffffffff199091161790555b60005460c860020a0260609081527f12d6cf44ad4fbb54b7b46b3982a2a0a379e51e7a0e9eea8e697cb8b10a89610990602090a156";

  if ("0x66548b4ad6d6be74bc2dbb53ef8c4df0f7b671b3" != "") {
    IsArt.address = "0x66548b4ad6d6be74bc2dbb53ef8c4df0f7b671b3";

    // Backward compatibility; Deprecated.
    IsArt.deployed_address = "0x66548b4ad6d6be74bc2dbb53ef8c4df0f7b671b3";
  }

  IsArt.generated_with = "1.0.3";
  IsArt.contract_name = "IsArt";

  return IsArt;
};

// Nicety for Node.
factory.load = factory;

if (typeof module != "undefined") {
  module.exports = factory;
} else {
  // There will only be one version of Pudding in the browser,
  // and we can use that.
  window.IsArt = factory;
}