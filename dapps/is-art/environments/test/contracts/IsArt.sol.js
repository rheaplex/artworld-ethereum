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
  IsArt.abi = [{ "constant": true, "inputs": [], "name": "is_art", "outputs": [{ "name": "", "type": "bytes6" }], "type": "function" }, { "constant": false, "inputs": [], "name": "toggle", "outputs": [], "type": "function" }, { "inputs": [], "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "is_art", "type": "bytes6" }], "name": "Status", "type": "event" }];
  IsArt.binary = "606060405260008054656973206e6f7465ffffffffffff1990911617905560d98061002a6000396000f3606060405260e060020a600035046316f5066a8114602457806340a3d246146032575b005b607f60005460d060020a0281565b60005460229060d060020a027f697300000000000000000000000000000000000000000000000000000000000014156089576000805465ffffffffffff1916656973206e6f7417905560a3565b6060908152602090f35b600080546569730000000065ffffffffffff199091161790555b60005460d060020a0260609081527f76eb140b75985f4db9e3deb060a1d4771955cde4ef5df1801482007d46c4a22290602090a156";

  if ("0x22f474da38b97dd6d3f02172f6809f32b91b051a" != "") {
    IsArt.address = "0x22f474da38b97dd6d3f02172f6809f32b91b051a";

    // Backward compatibility; Deprecated.
    IsArt.deployed_address = "0x22f474da38b97dd6d3f02172f6809f32b91b051a";
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