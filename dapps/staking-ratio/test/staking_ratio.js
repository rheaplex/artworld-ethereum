/* globals artifacts, assert, contract, it, web3 */

const StakingRatio = artifacts.require('./StakingRatio.sol')

const aAmount = web3.toWei(0.1, 'ether')
const bAmount = web3.toWei(0.2, 'ether')

contract('StakingRatio', function(accounts) {

  it('should start with zero as A and B', async function() {
    const instance = await StakingRatio.deployed()
    const a = await instance.aAmount.call()
    assert.equal(a.toNumber(), 0)
    const b = await instance.bAmount.call()
    assert.equal(b.toNumber(), 0)
  })

  it('should allow the user to stake both A and B', async function() {
    const instance = await StakingRatio.deployed()
    await instance.stakeA.sendTransaction({from: accounts[1], value: aAmount})
    const a = await instance.aAmount.call()
    assert.equal(a.toNumber(), aAmount)
    await instance.stakeB.sendTransaction({from: accounts[1], value: bAmount})
    const b = await instance.bAmount.call()
    assert.equal(b.toNumber(), bAmount)
  })

  it('should allow the user to stake A and B multiple times', async function() {
    const instance = await StakingRatio.deployed()
    await instance.stakeA.sendTransaction({from: accounts[1], value: aAmount})
    const a = await instance.aAmount.call()
    assert.equal(a.toNumber(), aAmount * 2)
    await instance.stakeB.sendTransaction({from: accounts[1], value: bAmount})
    const b = await instance.bAmount.call()
    assert.equal(b.toNumber(), bAmount * 2)
  })


  it('should allow multiple users to stake A and B', async function() {
    const instance = await StakingRatio.deployed()
    await instance.stakeA.sendTransaction({from: accounts[2], value: aAmount})
    const a = await instance.aAmount.call()
    assert.equal(a.toNumber(), aAmount * 3)
    await instance.stakeB.sendTransaction({from: accounts[2], value: bAmount})
    const b = await instance.bAmount.call()
    assert.equal(b.toNumber(), bAmount * 3)
  })

  it('should allow users with stake(s) to widthdraw', async function() {
    const instance = await StakingRatio.deployed()
    await instance.withdrawA.sendTransaction(aAmount, {from: accounts[1]})
    const a = await instance.aAmount.call()
    assert.equal(a.toNumber(), aAmount * 2)
    await instance.withdrawB.sendTransaction(bAmount, {from: accounts[1]})
    const b = await instance.bAmount.call()
    assert.equal(b.toNumber(), bAmount * 2)
  })

  it('should not allow users with no stake to widthdraw', async function() {
    const instance = await StakingRatio.deployed()
    await instance.withdrawA.sendTransaction(aAmount, {from: accounts[3]})
    const a = await instance.aAmount.call()
    assert.equal(a.toNumber(), aAmount * 2)
  })

  it('should allow users to widthdraw all their stake(s)', async function() {
    const instance = await StakingRatio.deployed()
    await instance.withdrawAll.sendTransaction({from: accounts[2]})
    const a = await instance.aAmount.call()
    assert.equal(a.toNumber(), aAmount)
    const b = await instance.bAmount.call()
    assert.equal(b.toNumber(), bAmount)
  })

})
