// Factory "morphs" into a Pudding class.
// The reasoning is that calling load in each context
// is cumbersome.

(function() {

  var contract_data = {
    abi: [{"constant":false,"inputs":[],"name":"getColour","outputs":[{"name":"r","type":"uint8"},{"name":"g","type":"uint8"},{"name":"b","type":"uint8"}],"type":"function"},{"constant":true,"inputs":[],"name":"red","outputs":[{"name":"","type":"uint8"}],"type":"function"},{"constant":false,"inputs":[{"name":"new_red","type":"uint8"},{"name":"new_green","type":"uint8"},{"name":"new_blue","type":"uint8"}],"name":"setColour","outputs":[],"type":"function"},{"constant":true,"inputs":[],"name":"blue","outputs":[{"name":"","type":"uint8"}],"type":"function"},{"constant":true,"inputs":[],"name":"green","outputs":[{"name":"","type":"uint8"}],"type":"function"},{"inputs":[],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"red","type":"uint8"},{"indexed":false,"name":"green","type":"uint8"},{"indexed":false,"name":"blue","type":"uint8"}],"name":"ColourChanged","type":"event"}],
    binary: "60606040526000805462ff0000600860ff199092169190911761ff0019166120001762ff0000191617815561012890819061003990396000f3606060405260e060020a6000350463216ec69b81146100475780632930cf241461006c578063d1aadb6a14610078578063ed18f0a7146100f7578063f2f1e13214610109575b005b60005460ff808216606090815261010083048216608052620100009092041660a05280f35b61011b60005460ff1681565b610045600435602435604435600080546201000083810262ff00001961010087810261ff001960ff199096168a17959095169490941716179283905560ff83811660609081529284048116608052920490911660a0527f9553d98b253039577cca7da758c94bb43d371a7b11b375ad11bada1331efc3e69080a1505050565b61011b60005462010000900460ff1681565b61011b60005460ff6101009091041681565b60ff166060908152602090f3",
    unlinked_binary: "60606040526000805462ff0000600860ff199092169190911761ff0019166120001762ff0000191617815561012890819061003990396000f3606060405260e060020a6000350463216ec69b81146100475780632930cf241461006c578063d1aadb6a14610078578063ed18f0a7146100f7578063f2f1e13214610109575b005b60005460ff808216606090815261010083048216608052620100009092041660a05280f35b61011b60005460ff1681565b610045600435602435604435600080546201000083810262ff00001961010087810261ff001960ff199096168a17959095169490941716179283905560ff83811660609081529284048116608052920490911660a0527f9553d98b253039577cca7da758c94bb43d371a7b11b375ad11bada1331efc3e69080a1505050565b61011b60005462010000900460ff1681565b61011b60005460ff6101009091041681565b60ff166060908152602090f3",
    address: "0x66925711817fa2d3a49298a1afcb28ae441d1141",
    generated_with: "2.0.9",
    contract_name: "BlankCanvas"
  };

  function Contract() {
    if (Contract.Pudding == null) {
      throw new Error("BlankCanvas error: Please call load() first before creating new instance of this contract.");
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
      throw new Error("BlankCanvas error: Please call load() first before calling new().");
    }

    return Contract.Pudding.new.apply(Contract, arguments);
  };

  Contract.at = function() {
    if (Contract.Pudding == null) {
      throw new Error("BlankCanvas error: Please call load() first before calling at().");
    }

    return Contract.Pudding.at.apply(Contract, arguments);
  };

  Contract.deployed = function() {
    if (Contract.Pudding == null) {
      throw new Error("BlankCanvas error: Please call load() first before calling deployed().");
    }

    return Contract.Pudding.deployed.apply(Contract, arguments);
  };

  if (typeof module != "undefined" && typeof module.exports != "undefined") {
    module.exports = Contract;
  } else {
    // There will only be one version of Pudding in the browser,
    // and we can use that.
    window.BlankCanvas = Contract;
  }

})();
