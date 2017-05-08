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
/* global artifacts assert contract it */

const LotterySymbol = artifacts.require('./LotterySymbol.sol');

contract('LotterySymbol', (accounts) => {
  it('should have a round length of 1 for testing',
     () => LotterySymbol.deployed()
     .then(instance => instance.roundLength.call())
     .then(roundLength => assert.equal(roundLength.toNumber(),
                                       1,
                                       'roundLength was not 1')));
  it('should initialise symbol to ☣',
     () => LotterySymbol.deployed()
     .then(instance => instance.symbol.call())
     .then(symbol => assert.equal(String.fromCharCode(symbol.toNumber()),
                                  '☣',
                                  'initial symbol was not ☣')));
  it('should register vote details', () => {
    const account0 = accounts[0];
    const account1 = accounts[1];
    const symbol0 = '*'.charCodeAt(0);
    const symbol1 = '8'.charCodeAt(0);
    let lotto;
    return LotterySymbol.deployed()
      .then((instance) => {
        lotto = instance;
        lotto.enterLottery(symbol0, { from: account0 });
      })
      .then(() => lotto.entriesCount.call())
      .then((entriesCount) => {
        assert.equal(entriesCount.toNumber(),
                     1,
                     'entry count did not increase');
        return lotto.entrants.call(0);
      })
     .then((entrant) => {
       assert.equal(entrant.toString(),
                    account0,
                    'first account not saved');
       return lotto.symbols.call(0);
     })
      .then(symbol => assert.equal(symbol.toNumber(),
                                   symbol0,
                                   'first symbol not saved'))
      .then(() => lotto.enterLottery(symbol1, { from: account1 }))
      .then(() => lotto.entriesCount.call())
      .then((entriesCount) => {
        assert.equal(entriesCount.toNumber(),
                     2,
                     'entry count did not increase');
        return lotto.entrants.call(1);
      })
      .then((entrant) => {
        assert.equal(entrant.toString(),
                     account1,
                     'second account not saved');
        return lotto.symbols.call(1);
      })
      .then(symbol => assert.equal(symbol.toNumber(),
                                   symbol1,
                                   'second symbol not saved'));
  });
});
