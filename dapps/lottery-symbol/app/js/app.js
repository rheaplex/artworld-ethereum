/*
 * Lottery Symbol - A symbol you can change via a lottery.
 * Copyright (C) 2017, 2020 Rob Myers <rob@robmyers.org>
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


////////////////////////////////////////////////////////////////////////////////
// The main contract behaviour object
////////////////////////////////////////////////////////////////////////////////

const LotterySymbolGui = {};

LotterySymbolGui.setSymbolRepresentation = function (symbol) {
  $('#symbol').text(symbol);
};

// This is complicated by:
// 1: unicode being complex.
// 2: web3 being weird.

LotterySymbolGui.symbolValToUnicodeStr = function (val) {
  const symbol = String.fromCodePoint(parseInt(val, 10));
  return symbol;
};

LotterySymbolGui.unicodeStrToSymbolValue = function (str) {
  
};

LotterySymbolGui.updateSymbol = function () {
  this.contract.methods.symbol().call().then(
    symbol => this.setSymbolRepresentation(
      this.symbolValToUnicodeStr(symbol)
    ));
};

LotterySymbolGui.setGuiSymbol = function (symbol) {
  $('#symbol-gui-symbol').val(symbol);
};

LotterySymbolGui.initialiseGuiSymbol = function () {
  this.contract.methods.symbol().call()
    .then(symbol => this.setGuiSymbol(this.symbolValToUnicodeStr(symbol)));
};

LotterySymbolGui.tryForAccountAccess = async function () {
  let account;
  if (window.ethereum) {
    try {
      // Request account access if needed
      account = (await ethereum.enable())[0];
    } catch (error) {
      account = false;
    }
  } else if (window.web3) {
    account = (await web3.eth.getAccounts())[0];
  } else {
    account = false;
  }
  return account;
};

LotterySymbolGui.finalizeRound = async function () {
  const account = await this.tryForAccountAccess();
  this.contract.methods.finalizeRound().send({ from: account, gas: 60000 });
};

LotterySymbolGui.getGuiSymbol = function () {
  return $('#symbol-gui-symbol').val();
};

LotterySymbolGui.symbolIsValid = function (symbol) {
  // Check unicode spread length to allow emoji etc.
  return ([...symbol].length === 1) // Correct length
    && (!symbol.match(/\s/)); // Not whitespace
};

LotterySymbolGui.tryForAccountAccess = async function () {
  let account;
  if (window.ethereum) {
    try {
      // Request account access if needed
      account = (await ethereum.enable())[0];
    } catch (error) {}
  } else if (window.web3) {
    account = (await web3.eth.getAccounts())[0];
  }
  return account;
};

LotterySymbolGui.commitNetworkEntry = async function (symbol) {
  const account = await this.tryForAccountAccess();
  if (!account) {
    return;
  }
  await this.contract.methods.enterLottery(symbol.codePointAt(0))
    .send({ from: account,gas: 130000 });
};

////////////////////////////////////////////////////////////////////////////////
// Contract manipulation GUI
////////////////////////////////////////////////////////////////////////////////

// Pad the number with a leading zero if needed to make it two digits

LotterySymbolGui.pad2 = function (number) {
  const str = number.toString();
  return str.length === 1 ? `0${str}` : str;
};

LotterySymbolGui.nextLotteryFinishes = function () {
  let previous;
  this.contract.methods.currentRoundEnds().call().then(
    currentRoundEnds => {
      const date = new Date(currentRoundEnds * 1000);
      previous = date <= (new Date().getTime());
      let prefix = 'Next round ends at';
      if (previous) {
        prefix = 'Previous round ended at';
      }
      $('.gui-next-round').text(
        `${prefix}: ${this.pad2(date.getHours())}:${this.pad2(date.getMinutes())}:${this.pad2(date.getSeconds())} on ${date.getFullYear()}-${this.pad2(date.getMonth())}-${this.pad2(date.getDate())}`
      );
      return this.contract.methods.numEntries().call();
    }).then(
      numEntries => $('#gui-finalize-button').prop(
        'disabled',
        ! ((numEntries > 0) && previous)
      )
    );
};

LotterySymbolGui.clearCurrentEntries = function () {
  $('#gui-current-entries').empty();
};

LotterySymbolGui.renderCurrentEntries = function () {
  LotterySymbolGui.contract.methods.getEntries().call()
    .then((entries) => {
      this.clearCurrentEntries();
      const numEntries = entries[0].length;
      if (numEntries > 0) {
        const entrants = entries[0];
        const symbols = entries[1];
        let html = '<tr><th>Entrant</th><th class="gui-current-entries-symbol">Symbol</th></tr>';
        for (var i = 0; i < numEntries; i++) {
          const entrant = entrants[i];
          const symbol = this.symbolValToUnicodeStr(symbols[i]);
          html += `<tr><td>${entrant}</td><td class="gui-current-entries-symbol">${symbol}</td></tr>`;
        }
        $('#gui-current-entries').append(html);
      }
    });
};

LotterySymbolGui.showGui = function () {
  $('#symbol').hide();
  $('.gui').show();
  this.initialiseGuiSymbol();
  this.nextLotteryFinishes();
  this.guiLotteryTimer = setInterval(() => {
    this.nextLotteryFinishes();
  }, 10000);
};

LotterySymbolGui.hideGui = function () {
  $('.gui').hide();
  clearInterval(this.guiLotteryTimer);
  this.guiLotteryTimer = null;
};

LotterySymbolGui.userSelectedUpdate = async function (event) {
  event.stopPropagation();
  const symbol = this.getGuiSymbol();
  if (this.symbolIsValid(symbol)) {
    $('#updating').html('Entering&hellip;');
    document.querySelector('#updating').style.setProperty('display', 'flex');
    this.hideGui();
    await this.commitNetworkEntry(symbol);
    document.querySelector('#updating').style.setProperty('display', 'none');
    $('#symbol').show();
  } else {
    alert('Invalid symbol. Make sure you enter a visible character in the "Symbol" field.');
  }
};

LotterySymbolGui.userSelectedCancel = function (event) {
  event.stopPropagation();
  this.hideGui();
  $('#symbol').show();
};

LotterySymbolGui.userSelectedFinalize = async function (event) {
  event.stopPropagation();
  $('#updating').html('Finalizing&hellip;');
  document.querySelector('#updating').style.setProperty('display', 'flex');
  this.hideGui();
  $('#symbol').show();
  await this.finalizeRound();
};

////////////////////////////////////////////////////////////////////////////////
// Main Program Lifecycle
////////////////////////////////////////////////////////////////////////////////

LotterySymbolGui.setupGui = function () {
  $('#updating').click(event => event.stopPropagation());
  $('#representation').click((event) => this.showGui());
  // Arrow functions so 'this' is LotterySymbolGui not the button when called
  $('#gui-update-button').click(event => this.userSelectedUpdate(event));
  $('#gui-cancel-button').click(event => this.userSelectedCancel(event));
  $('#gui-finalize-button').click(event => this.userSelectedFinalize(event));
  $('#gui-cancel-finalize-button')
    .click(event => this.userSelectedCancel(event));
  $('#gui-tabs a:first').tab('show');
  $('#symbol-gui-symbol').on('input',function(e) {
    // Unicode symbols are one character but n code points. Emoji are two.
    // So we allow two characters and truncate if we get more than 1 symbol.
    // Note the spread. This is to get the correct count.
    while ([...e.target.value].length > 1) {
      e.target.value = e.target.value.slice(0, -1);
    }
  });
};

LotterySymbolGui.initialise = async function () {
  // Connect to Ethereum or fail.
  if (window.ethereum) {
    // Modern web3
    window.web3 = new Web3(ethereum);
  } else if (window.web3) {
    // Old school web3
    window.web3 = new Web3(web3.currentProvider);
  } else {
    document.write(
      'No Ethereum access. Try an Ethereum plugin or Ethereum-enabled browser'
    );
    return;
  }

  // Make a Web3.js 1.0 contract instance of the contract.
  const contractNetworkResponse = await fetch(
    // Relative to index.html, not this file.
    "../build/contracts/LotterySymbol.json"
  );
  const contractJSON = await contractNetworkResponse.json();
  const abi = contractJSON.abi;
  const network = await web3.eth.net.getId();
  const address = contractJSON.networks[network].address;
  this.contract = new web3.eth.Contract(abi, address);

  this.setupGui();

  this.renderCurrentEntries();
  this.contract.events.SymbolChanged().on(
    'data',
    event => {
      this.renderCurrentEntries();
      this.updateSymbol();      
    }
  );
  this.contract.events.NewEntry().on(
    'data',
    event => this.renderCurrentEntries()  
  );
  this.updateSymbol();
};

$(window).on('load', () => {
  LotterySymbolGui.initialise();
});
