// Factory "morphs" into a Pudding class.
// The reasoning is that calling load in each context
// is cumbersome.

(function() {

  var contract_data = {
    abi: [{"constant":true,"inputs":[],"name":"is_art","outputs":[{"name":"","type":"bytes6"}],"type":"function"},{"constant":false,"inputs":[],"name":"toggle","outputs":[],"type":"function"},{"inputs":[],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"is_art","type":"bytes6"}],"name":"Status","type":"event"}],
    binary: "606060405260008054656973206e6f7465ffffffffffff1990911617905560d98061002a6000396000f3606060405260e060020a600035046316f5066a8114602457806340a3d246146032575b005b607f60005460d060020a0281565b60005460229060d060020a027f697300000000000000000000000000000000000000000000000000000000000014156089576000805465ffffffffffff1916656973206e6f7417905560a3565b6060908152602090f35b600080546569730000000065ffffffffffff199091161790555b60005460d060020a0260609081527f76eb140b75985f4db9e3deb060a1d4771955cde4ef5df1801482007d46c4a22290602090a156",
    unlinked_binary: "606060405260008054656973206e6f7465ffffffffffff1990911617905560d98061002a6000396000f3606060405260e060020a600035046316f5066a8114602457806340a3d246146032575b005b607f60005460d060020a0281565b60005460229060d060020a027f697300000000000000000000000000000000000000000000000000000000000014156089576000805465ffffffffffff1916656973206e6f7417905560a3565b6060908152602090f35b600080546569730000000065ffffffffffff199091161790555b60005460d060020a0260609081527f76eb140b75985f4db9e3deb060a1d4771955cde4ef5df1801482007d46c4a22290602090a156",
    address: "0xa95301a50551dfe16e180dec3fe0044e94d36f8c",
    generated_with: "2.0.6",
    contract_name: "IsArt"
  };

  function Contract() {
    if (Contract.Pudding == null) {
      throw new Error("IsArt error: Please call load() first before creating new instance of this contract.");
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
      throw new Error("IsArt error: Please call load() first before calling new().");
    }

    return Contract.Pudding.new.apply(Contract, arguments);
  };

  Contract.at = function() {
    if (Contract.Pudding == null) {
      throw new Error("IsArt error: lease call load() first before calling at().");
    }

    return Contract.Pudding.at.apply(Contract, arguments);
  };

  Contract.deployed = function() {
    if (Contract.Pudding == null) {
      throw new Error("IsArt error: Please call load() first before calling deployed().");
    }

    return Contract.Pudding.deployed.apply(Contract, arguments);
  };

  if (typeof module != "undefined" && typeof module.exports != "undefined") {
    module.exports = Contract;
  } else {
    // There will only be one version of Pudding in the browser,
    // and we can use that.
    window.IsArt = Contract;
  }

})();
