const HDWalletProvider = require('truffle-hdwallet-provider');

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
      mainnet: {
      //provider: () => new HDWalletProvider(process.env.MNEMONIC,
      //                                     "http://127.0.0.1:8545",
      //                                     process.env.ADDRESS_INDEX || 1),
      provider: () => new HDWalletProvider(process.env.MNEMONIC,
                                           `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
                                           process.env.ADDRESS_INDEX || 1),
      //host: "127.0.0.1",
      //port: 8545,
      network_id: 1,
      gas: 6700000,
      gasPrice: 3000000000,  // 3 gwei (in wei) (default: 100 gwei)
      // websockets: true,   // Enable EventEmitter interface for web3 (default: false)
      timeoutBlocks: 200,    // # of blocks before a deployment times out  (minimum/default: 50),
      confirmations: 1
    },
  },
};
