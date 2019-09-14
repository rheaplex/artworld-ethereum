/*global artifacts, assert, before, contract, it*/

const PayPreviousPath = artifacts.require('PayPreviousPath');

const toBNArray = a => a.map(web3.utils.toBN);

const x1 = toBNArray([
  1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2
]);
const y1 = toBNArray([
  0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1
]);
const x2 = toBNArray([
  1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2
]);
const y2 = toBNArray([
  0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1
]);
const x = toBNArray([
  1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2
]);
const y = toBNArray([
  0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1
]);
const t = toBNArray([
  1,2,3,4,3,2,1,2,3,4,1,2,3,4,3,2,1,2,3,4,1,2,3,4,3,2,1,2,3,4,1,2
]);
const tt = toBNArray([
  1,3,4,1,2,3,4,3,2,1,2,3,4,1,2,3,4,3,2,1,2,3,4,1,2,2,3,4,3,2,1,2
]);

const txCost = (r, gasPrice) => web3.utils.toBN(gasPrice * r.receipt.gasUsed);

const fromBNArray = a => a.map(b => b.toNumber());

contract('PayPreviousPath', async accounts => {
  let ppp;

  before(async () => {
    ppp = await PayPreviousPath.deployed();
  });
  
  it('should allow users to set the path', async () => {
    const senderBalanceBefore = web3.utils.toBN(await web3.eth.getBalance(
      accounts[1]
    ));
    const gasPrice = await web3.eth.getGasPrice();
    const fee = await ppp.calculateFee(gasPrice);
    const r = await ppp.setPath(
      t,
      x1,
      y1,
      x2,
      y2,
      x,
      y,
      {
        value: fee,
        gasPrice: gasPrice,
        from: accounts[1]
      }
    );
    const senderBalanceAfter = web3.utils.toBN(await web3.eth.getBalance(
      accounts[1]
    ));
    assert.ok(senderBalanceBefore.eq(
      senderBalanceAfter.add(fee).add(txCost(r, gasPrice))
    ));
  });

  it('should allow users to get the path', async () => {
    const path = await ppp.getPath();
    assert.deepEqual(fromBNArray(path.command), fromBNArray(t));
    assert.deepEqual(fromBNArray(path.x1), fromBNArray(x1));
    assert.deepEqual(fromBNArray(path.y1), fromBNArray(y1));
    assert.deepEqual(fromBNArray(path.x2), fromBNArray(x2));
    assert.deepEqual(fromBNArray(path.y2), fromBNArray(y2));
    assert.deepEqual(fromBNArray(path.x), fromBNArray(x));
    assert.deepEqual(fromBNArray(path.y), fromBNArray(y));
  });

  it('should allow previous payer to withdraw their payment', async () => {
    const gasPrice = await web3.eth.getGasPrice();
    const fee = await ppp.calculateFee(gasPrice);
    await ppp.setPath(
      tt,
      x2,
      y2,
      x,
      y,
      x1,
      y1,
      {
        value: fee,
        gasPrice: gasPrice,
        from: accounts[2]
      }
    );
    const senderBalanceBefore = web3.utils.toBN(await web3.eth.getBalance(
      accounts[1]
    ));
    const r = await ppp.withdrawPayments(
      accounts[1],
      { from: accounts[1], gasPrice: gasPrice }
    );
    const senderBalanceAfter = web3.utils.toBN(await web3.eth.getBalance(
      accounts[1]
    ));
    assert.ok(senderBalanceAfter.gt(
      senderBalanceBefore.sub(txCost(r, gasPrice))
    ));
  });

  it('current payer should have nothing to withdraw', async () => {
    const gasPrice = await web3.eth.getGasPrice();
    const senderBalanceBefore = web3.utils.toBN(await web3.eth.getBalance(
      accounts[2]
    ));
    const r = await ppp.withdrawPayments(
      accounts[2],
      { from: accounts[2], gasPrice: gasPrice }
    );
    const senderBalanceAfter = web3.utils.toBN(await web3.eth.getBalance(
      accounts[2]
    ));
    assert.ok(senderBalanceAfter.eq(
      senderBalanceBefore.sub(txCost(r, gasPrice))
    ));
  });

  it('other users should have nothing to withdraw', async () => {
    const gasPrice = await web3.eth.getGasPrice();
    const senderBalanceBefore = web3.utils.toBN(await web3.eth.getBalance(
      accounts[3]
    ));
    const r = await ppp.withdrawPayments(
      accounts[3],
      { from: accounts[3], gasPrice: gasPrice }
    );
    const senderBalanceAfter = web3.utils.toBN(await web3.eth.getBalance(
      accounts[3]
    ));
    assert.ok(senderBalanceAfter.eq(
      senderBalanceBefore.sub(txCost(r, gasPrice))
    ));
  });
});
