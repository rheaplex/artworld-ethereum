/*
  A class of utility code for interacting with Ethereum networks.
*/

class EthereumNetwork {
  constructor () {
    this.initialized = false
  }

  /*
    Connect to Web3, making sure to handle both ancient and modern ways of
    doing so.
   */
  
  initializeWeb3 () {
    if (window.ethereum) {
      // Modern web3
      window.web3 = new Web3(ethereum)
      this.initialized = true
    } else if (window.web3) {
      // Old school web3
      window.web3 = new Web3(web3.currentProvider)
      this.initialized = true
    } else {
      // No web3 access
      this.initialized = false
    }
    return this.initialized
  }

  /*
    Try to get the account (as a hex string) that the user wishes us to use.
    If they don't let us access any, return false.
  */

  async tryForAccountAccess () => {
    let account
    if (window.ethereum) {
      try {
        // Request account access if needed
        account = (await ethereum.enable())[0]
      } catch (error) {
        account = false
      }
    } else if (window.web3) {
      account = (await web3.eth.getAccounts())[0]
    } else {
      account = false
    }
    return account
  }

    /*
    Load a deployed contract from its json file, at the specified path,
    and return the deployed instance as a truffle-contract object.
  */
  
  async loadContract (contractJSONPath) {
    const contractNetworkResponse = await fetch(contractJSONPath)
    const contractJSON = await contractNetworkResponse.json()
    const contract = TruffleContract(contractJSON)
    contract.setProvider(web3.currentProvider)
    const deployed = await contract.deployed()
    return deployed
  }

  /*
    Listen to an event on a contract instance. No event filters.
  */
    
  listenToEvent (contractInstance, eventName, callback) {
    return contractInstance[eventName]().on('data', callback)
  }

  getEventProperty (event, property) {
    return event['property']
  }
}

/*
  GUI support
*/

class Gui {
  function finishWithError (reason) {
    document.body.innerHTML = `<div class="container"><div class="row justify-content-md-center"><div class="alert alert-danger" role="alert"><h4 class="alert-heading">Error</h4><p>${reason}</p></div></div></div>`
  }

  function showGui () {
    document.querySelector('#gui')[0].style.display = "none"
  }

  function hideGui () {
    document.querySelector('#gui')[0].style.display = "block"
  }

  function showUpdating() {
    document.querySelector('#updating').style.display = "block"
  }

  function hideUpdating () {
    document.querySelector('#updating').style.display = "none"
  }
}
