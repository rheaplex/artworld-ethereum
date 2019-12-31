/*global artifacts, assert, contract, it, web3*/

const StakingRatio = artifacts.require('./StakingRatio.sol');

const aAmount = web3.utils.toBN(web3.utils.toWei('0.1', 'ether'));
const bAmount = web3.utils.toBN(web3.utils.toWei('0.2', 'ether'));

//FIXME: There are some order dependencies in these tests.

contract('StakingRatio', function(accounts) {

  it('should start with zero as A and B', async function() {
    const instance = await StakingRatio.deployed();
    const a = await instance.totalAmountA.call();
    assert.equal(a.toNumber(), 0);
    const b = await instance.totalAmountB.call();
    assert.equal(b.toNumber(), 0);
  });

  it('should allow the user to stake both A and B', async function() {
    const instance = await StakingRatio.deployed();
    await instance.stakeA.sendTransaction({from: accounts[1], value: aAmount});
    const a = await instance.totalAmountA.call();
    assert.ok(a.eq(aAmount));
    const aStake = await instance.myAStake({ from: accounts[1] });
    assert.ok(aStake.eq(aAmount));
    await instance.stakeB.sendTransaction({from: accounts[1], value: bAmount});
    const b = await instance.totalAmountB.call();
    assert.ok(b.eq(bAmount));
    const bStake = await instance.myBStake({ from: accounts[1] });
    assert.ok(bStake.eq(bAmount));
  });

  it('should allow the user to stake A and B multiple times', async function() {
    const instance = await StakingRatio.deployed();
    await instance.stakeA.sendTransaction({from: accounts[1], value: aAmount});
    const a = await instance.totalAmountA.call();
    assert.ok(a.eq(aAmount.mul(web3.utils.toBN(2))));
    const aStake = await instance.myAStake({ from: accounts[1] });
    assert.ok(aStake.eq(aAmount.mul(web3.utils.toBN(2))));
    await instance.stakeB.sendTransaction({from: accounts[1], value: bAmount});
    const b = await instance.totalAmountB.call();
    assert.ok(b.eq(bAmount.mul(web3.utils.toBN(2))));
    const bStake = await instance.myBStake({ from: accounts[1] });
    assert.ok(bStake.eq(bAmount.mul(web3.utils.toBN(2))));
  });

  it('should allow multiple users to stake A and B', async function() {
    const instance = await StakingRatio.deployed();
    await instance.stakeA.sendTransaction({from: accounts[2], value: aAmount});
    const a = await instance.totalAmountA.call();
    assert.ok(a.eq(aAmount.mul(web3.utils.toBN(3))));
    const aStake = await instance.myAStake({ from: accounts[2] });
    assert.ok(aStake.eq(aAmount));
    await instance.stakeB.sendTransaction({from: accounts[2], value: bAmount});
    const b = await instance.totalAmountB.call();
    assert.ok(b.eq(bAmount.mul(web3.utils.toBN(3))));
    const bStake = await instance.myBStake({ from: accounts[2] });
    assert.ok(bStake.eq(bAmount));
  });

  it('should allow users with stake(s) to widthdraw', async function() {
    const instance = await StakingRatio.deployed();
    await instance.withdrawA.sendTransaction({from: accounts[1]});
    const a = await instance.totalAmountA.call();
    assert.ok(a.eq(aAmount));    
    const aStake = await instance.myAStake({ from: accounts[1] });
    assert.ok(aStake.eq(web3.utils.toBN(0)));
    await instance.withdrawB.sendTransaction({from: accounts[1]});
    const b = await instance.totalAmountB.call();
    assert.ok(b.eq(bAmount));
    const bStake = await instance.myBStake({ from: accounts[1] });
    assert.ok(bStake.eq(web3.utils.toBN(0)));
  });

  it('should not allow users with no stake to widthdraw', async function() {
    const instance = await StakingRatio.deployed();
    await instance.withdrawA.sendTransaction({from: accounts[3]});
    const a = await instance.totalAmountA.call();
    assert.ok(a.eq(aAmount));
  });

  it('should allow users to widthdraw all their stake(s)', async function() {
    const instance = await StakingRatio.deployed();
    await instance.withdrawAll.sendTransaction({from: accounts[2]});
    const a = await instance.totalAmountA.call();
    assert.ok(a.eq(web3.utils.toBN(0)));
    const b = await instance.totalAmountB.call();
    assert.ok(b.eq(web3.utils.toBN(0)));
  });
});
