// Factory "morphs" into a Pudding class.
// The reasoning is that calling load in each context
// is cumbersome.

(function() {

  var contract_data = {
    abi: [{"constant":true,"inputs":[],"name":"cold","outputs":[{"name":"","type":"bytes4"}],"type":"function"},{"constant":false,"inputs":[],"name":"swap","outputs":[],"type":"function"},{"constant":true,"inputs":[],"name":"hot","outputs":[{"name":"","type":"bytes4"}],"type":"function"},{"inputs":[],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"hot","type":"bytes4"},{"indexed":false,"name":"cold","type":"bytes4"}],"name":"Swap","type":"event"}],
    binary: "60606040526000805467ffffffff00000000191667636f6c64000000001763ffffffff191663686f740017815560d890819061003a90396000f3606060405260e060020a6000350463578e9dc58114602e5780638119c065146044578063dde9c2971460c0575b005b60ce600054640100000000900460e060020a0281565b6000805463ffffffff19811660e060020a64010000000080840482028290049290921767ffffffff00000000191692810281810483029390931793849055838102606090815291909304909202608052602c917f62258dc242c94c7f047f3265c30b72955e97185dd53c59ad9c27521829ba986190604090a150565b60ce60005460e060020a0281565b6060908152602090f3",
    unlinked_binary: "60606040526000805467ffffffff00000000191667636f6c64000000001763ffffffff191663686f740017815560d890819061003a90396000f3606060405260e060020a6000350463578e9dc58114602e5780638119c065146044578063dde9c2971460c0575b005b60ce600054640100000000900460e060020a0281565b6000805463ffffffff19811660e060020a64010000000080840482028290049290921767ffffffff00000000191692810281810483029390931793849055838102606090815291909304909202608052602c917f62258dc242c94c7f047f3265c30b72955e97185dd53c59ad9c27521829ba986190604090a150565b60ce60005460e060020a0281565b6060908152602090f3",
    address: "0x53cd5d6bebff1eef892c191875e4d963875f50d7",
    generated_with: "2.0.6",
    contract_name: "HotCold"
  };

  function Contract() {
    if (Contract.Pudding == null) {
      throw new Error("HotCold error: Please call load() first before creating new instance of this contract.");
    }

    Contract.Pudding.apply(this, arguments);
  };

  Contract.load = function(Pudding) {
    Contract.Pudding = Pudding;

    Pudding.whisk(contract_data, Contract);

    // Return itself for backwards compatibility.
    return Contract;
  }

  Contract.new = function() {
    if (Contract.Pudding == null) {
      throw new Error("HotCold error: Please call load() first before calling new().");
    }

    return Contract.Pudding.new.apply(Contract, arguments);
  };

  Contract.at = function() {
    if (Contract.Pudding == null) {
      throw new Error("HotCold error: lease call load() first before calling at().");
    }

    return Contract.Pudding.at.apply(Contract, arguments);
  };

  Contract.deployed = function() {
    if (Contract.Pudding == null) {
      throw new Error("HotCold error: Please call load() first before calling deployed().");
    }

    return Contract.Pudding.deployed.apply(Contract, arguments);
  };

  if (typeof module != "undefined" && typeof module.exports != "undefined") {
    module.exports = Contract;
  } else {
    // There will only be one version of Pudding in the browser,
    // and we can use that.
    window.HotCold = Contract;
  }

})();
