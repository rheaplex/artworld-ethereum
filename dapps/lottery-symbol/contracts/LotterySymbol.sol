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


pragma solidity ^0.4.4;


contract LotterySymbol {

    uint public roundLength;

    event SymbolChanged(uint32 symbol, address winner);

    // Biohazard symbol
    uint32 public symbol = 9763;

    uint public currentRound = 0;
    uint public entriesCount = 0;
    address[] public entrants;
    uint32[] public symbols;

    function LotterySymbol (uint roundLengthValue) {
        // Set this here so we can make it short for testing
        // We could also handle this with a testing subclass and appropriate
        // access control in this contract.
        roundLength = roundLengthValue;
    }

    function isStateStale () public returns (bool should) {
        blockToRound(block.number) > currentRound;
    }

    // A function to call that ensures the symbol is current.
    // Why call this? To make sure you have current data.
    // The caller can time calling this to game the choice of winner.
    // So this is demo quality code only.

    function refreshState () public returns (uint32 symbolValue) {
        maybeNewRound();
        symbol;
    }

    function enterLottery (uint32 symbol) public {
        // Since we aren't running this on a cron job, call it where we can
        //maybeNewRound();
        // An entrant may enter several times a round with the same or different
        // symbols.
        // http://ethereum.stackexchange.com/questions/3373/how-to-clear-large-arrays-without-blowing-the-gas-limit
        if (entriesCount == entrants.length) {
            entrants.length += 1;
            symbols.length += 1;
        }
        entrants[entriesCount] = msg.sender;
        symbols[entriesCount] = symbol;
        entriesCount += 1;
    }

    function maybeNewRound () private {
        if (isStateStale()) {
            chooseWinner();
            newRound();
        }
    }

    function blockToRound (uint blockNumber) private returns (uint round) {
        blockNumber % roundLength;
    }

    function chooseWinner ()
        private
        returns (uint32 winningSymbol, address winningEntrant)
    {
        // This allows gaming if the caller gets to choose the block
        // (which at low entry volumes is easy). So this is demo quality only.
        uint index = uint(block.blockhash(block.number)) % uint(entriesCount);
        symbol = symbols[index];
        winningSymbol = symbol;
        winningEntrant = entrants[index];
        SymbolChanged(winningSymbol, winningEntrant);
    }

    function newRound () private {
        // http://ethereum.stackexchange.com/questions/3373/how-to-clear-large-arrays-without-blowing-the-gas-limit
        entriesCount = 0;
        currentRound += 1;
    }
}
