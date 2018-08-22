/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a 
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() { 
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>') 
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */

module.exports = {
    networks: {
	"live": {
	    network_id: 1, // Ethereum public network
	    host: "127.0.0.1",
	    port: 8545,
	    gasPrice: 1000000000,
	    from: "0x7b227bB88E79284a3B21C723789e18Fc5503B452"
	},
	development: {
	    network_id: "*", // Match any network id
	    host: "127.0.0.1",
	    port: 9545
	}
    }
}
