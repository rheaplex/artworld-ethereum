web3.setProvider(new web3.providers.HttpProvider('http://localhost:8101'));web3.eth.defaultAccount = web3.eth.accounts[0];IsArtAbi = [{"constant":true,"inputs":[],"name":"is_art","outputs":[{"name":"","type":"bytes7"}],"type":"function"},{"constant":false,"inputs":[],"name":"toggle","outputs":[],"type":"function"},{"inputs":[],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"is_art","type":"bytes7"}],"name":"Status","type":"event"}];IsArtContract = web3.eth.contract(IsArtAbi);IsArt = IsArtContract.at('0xc305c901078781c232a2a521c2af7980f8385ee9');