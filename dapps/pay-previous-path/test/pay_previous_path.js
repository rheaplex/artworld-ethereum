/* globals artifacts, assert, contract, it */

const PayPreviousPath = artifacts.require('./PayPreviousPath.sol')

const x1 = [1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2]
const y1 = [0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1]
const t1 = [1,2,3,4,3,2,1,2,3,4,1,2,3,4,3,2,1,2,3,4,1,2,3,4,3,2,1,2,3,4,1,2]

const toNumberArray = a => { return a.map(x => x.toNumber()) }

const payAmount = parseInt(web3.toWei(0.01, 'ether'))

contract('PayPreviousPath', accounts => {

  it('should allow users to set the path', async () => {
    const instance = await PayPreviousPath.deployed()
    // Hello gotcha. toWei returns string for numbers (bignum for bignums)
    const initialAmount = (await instance.previousPayerAmount.call()).toNumber()
    await instance.setPath.sendTransaction(x1,
                                           y1,
                                           t1,
                                           {value: payAmount + initialAmount,
                                            from: accounts[1]})
    const payer = await instance.previousPayer.call()
    assert.equal(payer, accounts[1])
    const amount = (await instance.previousPayerAmount.call()).toNumber()
    assert.equal(amount, payAmount)
    const balance = web3.eth.getBalance(instance.address).toNumber()
    assert.equal(balance, payAmount + initialAmount)
  })

  it('should allow users to get the path', async () => {
    const instance = await PayPreviousPath.deployed()
    const [x,y,t] = await instance.getCurrentPath.call()
    assert.deepEqual(toNumberArray(x), x1)
    assert.deepEqual(toNumberArray(y), y1)
    assert.deepEqual(toNumberArray(t), t1)
  })

  it('should allow previous payer to withdraw their payment', async () => {
    const instance = await PayPreviousPath.deployed()
    const startingBalance = web3.eth.getBalance(accounts[0]).toNumber()
    await instance.withdrawPreviousPayments.sendTransaction({from: accounts[0]})
    const newBalance = web3.eth.getBalance(accounts[0]).toNumber()
    assert.isOk(newBalance > startingBalance)
  })

  it('should not allow current payer to withdraw their payment', async () => {
    const instance = await PayPreviousPath.deployed()
    const startingBalance = web3.eth.getBalance(accounts[1]).toNumber()
    await instance.withdrawPreviousPayments.sendTransaction({from: accounts[1]})
    const newBalance = web3.eth.getBalance(accounts[1]).toNumber()
    // Lower because of gas payment
    assert.isOk(newBalance < startingBalance)
  })

  it('should not allow other users to withdraw any payments', async () => {
    const instance = await PayPreviousPath.deployed()
    const startingBalance = web3.eth.getBalance(accounts[2]).toNumber()
    await instance.withdrawPreviousPayments.sendTransaction({from: accounts[2]})
    const newBalance = web3.eth.getBalance(accounts[2]).toNumber()
    // Lower because of gas payment
    assert.isOk(newBalance < startingBalance)
  })

})
