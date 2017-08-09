/*
 * Lottery Symbol - A symbol you can change via a lottery.
 * Copyright (C) 2017 Rob Myers <rob@robmyers.org>
 *
 * This file is part of Lottery Symbol.
 *
 * Lottery Symbol is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Lottery Symbol is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Lottery Symbol.  If not, see <http://www.gnu.org/licenses/>.
 */

/* For eslint */
/* global artifacts assert contract it web3 */

const LotterySymbol = artifacts.require('./LotterySymbol.sol');

contract('LotterySymbol', (accounts) => {
  const account0 = accounts[0];
  const account1 = accounts[1];
  const symbol0 = '*'.charCodeAt(0);
  const symbol1 = '8'.charCodeAt(0);

  it('should have a round length of 86400',
     () => LotterySymbol.deployed()
     .then(instance => instance.ROUND_LENGTH.call())
     .then(roundLength => assert.equal(roundLength.toNumber(),
                                       86400,
                                       'roundLength was not 86400')));
  it('should initialise symbol to ☣',
     () => LotterySymbol.deployed()
     .then(instance => instance.symbol.call())
     .then(symbol => assert.equal(String.fromCharCode(symbol.toNumber()),
                                  '☣',
                                  'initial symbol was not ☣')));
  it('should register vote details', () => {
    let lotto;
    return LotterySymbol.deployed()
      .then((instance) => {
        lotto = instance;
        return lotto.enterLottery(symbol0, { from: account0 });
      })
      .then(() => lotto.numEntries.call())
      .then((entriesCount) => {
        assert.equal(entriesCount.toNumber(),
                     1,
                     'entry count did not increase');
        return lotto.entries.call(0);
      })
      .then((entry) => {
        assert.equal(entry[0],
                     account0,
                     'first account not saved');
        assert.equal(entry[1].toNumber(),
                     symbol0,
                     'first symbol not saved')
      })
      .then(() => lotto.enterLottery(symbol1, { from: account1 }))
      .then(() => lotto.numEntries.call())
      .then((entriesCount) => {
        assert.equal(entriesCount.toNumber(),
                     2,
                     'entry count did not increase');
        return lotto.entries.call(1);
      })
      .then((entry) => {
        assert.equal(entry[0],
                     account1,
                     'second account not saved');
        assert.equal(entry[1].toNumber(),
                     symbol1,
                     'second symbol not saved');
      });
  });
  it('should choose a winner after the round length', () => {
    let lotto;
    return LotterySymbol.deployed()
      .then((instance) => {
        lotto = instance;
        return lotto.ROUND_LENGTH.call();
      })
      .then(() => {
        web3.currentProvider.send({
          jsonrpc: '2.0',
          method: 'evm_increaseTime',
          params: [86400 + 60],
          id: new Date().getTime()
        });
        lotto.finalizeRound();
      })
      .then(() => lotto.symbol.call())
      .then((symbol) => {
        assert.notEqual(String.fromCharCode(symbol.toNumber()),
                        '☣',
                        'symbol was still ☣');
      });
  });
  it('should clear entries from previous round', () => {
    let lotto;
    return LotterySymbol.deployed()
      .then((instance) => {
        lotto = instance;
        return lotto.numEntries.call();
      })
      .then((entriesCount) => {
        assert.equal(entriesCount.toNumber(),
                     0,
                     'entry count was not reset');
      });
  });
});
