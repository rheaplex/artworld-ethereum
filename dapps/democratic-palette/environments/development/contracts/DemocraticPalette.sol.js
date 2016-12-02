// Factory "morphs" into a Pudding class.
// The reasoning is that calling load in each context
// is cumbersome.

(function() {

  var contract_data = {
    abi: [{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"palette","outputs":[{"name":"red","type":"uint8"},{"name":"green","type":"uint8"},{"name":"blue","type":"uint8"},{"name":"votes","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"red","type":"uint8"},{"name":"green","type":"uint8"},{"name":"blue","type":"uint8"}],"name":"voteCount","outputs":[{"name":"count","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"red","type":"uint8"},{"name":"green","type":"uint8"},{"name":"blue","type":"uint8"}],"name":"voteFor","outputs":[],"type":"function"},{"inputs":[],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"index","type":"uint256"}],"name":"PaletteChanged","type":"event"}],
    binary: "60606040526103af806100126000396000f3606060405260e060020a60003504639cb71ef881146100315780639ede7a371461006c578063d32ab21d1461009d575b005b6100b6600435600181600c811015610002575060029182029081015491015460ff828116926101008104821692620100009091049091169084565b6100e5600435602435604435600080806100f78686865b60ff908116618aed02918116610100029216919091010190565b61002f6004356024356044356000610115848484610083565b6040805160ff958616815293851660208501529190931682820152606082019290925290519081900360800190f35b60408051918252519081900360200190f35b62ffffff168152602081019190915260400160002054949350505050565b62ffffff811660009081526020819052604090208054600101908190559091506101f590859085908590600060006000600060006019600050548611156103a4575b600c84101561021a576101fb600185600c811015610002576002020160005060408051608081018252825460ff81811683526101008204811660208401526201000090910416918101919091526001919091015460608201528a8a8a60008360ff16856000015160ff161480156101d757508260ff16856020015160ff16145b80156101ec57508160ff16856040015160ff16145b95945050505050565b50505050565b156103155785600185600c811015610002576002908102019190915594505b8415156102c557600092505b600c8310156102c557601954600184600c811015610002576002020160005060010154141561032157604080516080810182528a8152602081018a905290810188905260608101879052600184600c8110156100025760020201600050815181546020840151604085015162010000026101009190910260ff199290921690921761ff0019161762ff0000191617815560609190910151600191909101555b505060025460015b600c81101561032d57601954600182600c811015610002576002020160005060010154141561030d57600181600c81101561000257600290810201549250505b6001016102cd565b60019390930192610157565b60019290920191610226565b60198290558415610370576040805185815290517fdcbfb96c25cc4a622eb6003b4618e02a632a9c74b64b10f02fd73d96be1efd7d9181900360200190a16103a4565b6040805184815290517fdcbfb96c25cc4a622eb6003b4618e02a632a9c74b64b10f02fd73d96be1efd7d9181900360200190a15b50505050505050505056",
    unlinked_binary: "60606040526103af806100126000396000f3606060405260e060020a60003504639cb71ef881146100315780639ede7a371461006c578063d32ab21d1461009d575b005b6100b6600435600181600c811015610002575060029182029081015491015460ff828116926101008104821692620100009091049091169084565b6100e5600435602435604435600080806100f78686865b60ff908116618aed02918116610100029216919091010190565b61002f6004356024356044356000610115848484610083565b6040805160ff958616815293851660208501529190931682820152606082019290925290519081900360800190f35b60408051918252519081900360200190f35b62ffffff168152602081019190915260400160002054949350505050565b62ffffff811660009081526020819052604090208054600101908190559091506101f590859085908590600060006000600060006019600050548611156103a4575b600c84101561021a576101fb600185600c811015610002576002020160005060408051608081018252825460ff81811683526101008204811660208401526201000090910416918101919091526001919091015460608201528a8a8a60008360ff16856000015160ff161480156101d757508260ff16856020015160ff16145b80156101ec57508160ff16856040015160ff16145b95945050505050565b50505050565b156103155785600185600c811015610002576002908102019190915594505b8415156102c557600092505b600c8310156102c557601954600184600c811015610002576002020160005060010154141561032157604080516080810182528a8152602081018a905290810188905260608101879052600184600c8110156100025760020201600050815181546020840151604085015162010000026101009190910260ff199290921690921761ff0019161762ff0000191617815560609190910151600191909101555b505060025460015b600c81101561032d57601954600182600c811015610002576002020160005060010154141561030d57600181600c81101561000257600290810201549250505b6001016102cd565b60019390930192610157565b60019290920191610226565b60198290558415610370576040805185815290517fdcbfb96c25cc4a622eb6003b4618e02a632a9c74b64b10f02fd73d96be1efd7d9181900360200190a16103a4565b6040805184815290517fdcbfb96c25cc4a622eb6003b4618e02a632a9c74b64b10f02fd73d96be1efd7d9181900360200190a15b50505050505050505056",
    address: "0xaf1aafda1101a20e94c821cdb3d86e27ef3baf66",
    generated_with: "2.0.9",
    contract_name: "DemocraticPalette"
  };

  function Contract() {
    if (Contract.Pudding == null) {
      throw new Error("DemocraticPalette error: Please call load() first before creating new instance of this contract.");
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
      throw new Error("DemocraticPalette error: Please call load() first before calling new().");
    }

    return Contract.Pudding.new.apply(Contract, arguments);
  };

  Contract.at = function() {
    if (Contract.Pudding == null) {
      throw new Error("DemocraticPalette error: Please call load() first before calling at().");
    }

    return Contract.Pudding.at.apply(Contract, arguments);
  };

  Contract.deployed = function() {
    if (Contract.Pudding == null) {
      throw new Error("DemocraticPalette error: Please call load() first before calling deployed().");
    }

    return Contract.Pudding.deployed.apply(Contract, arguments);
  };

  if (typeof module != "undefined" && typeof module.exports != "undefined") {
    module.exports = Contract;
  } else {
    // There will only be one version of Pudding in the browser,
    // and we can use that.
    window.DemocraticPalette = Contract;
  }

})();
