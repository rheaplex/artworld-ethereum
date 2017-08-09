/*
 * Lottery Symbol - A symbol you can change via a lottery.
 * Copyright (C) 2017 Rhea Myers <rob@Rhea Myers.org>
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

/* global $ Shared LotterySymbol */

////////////////////////////////////////////////////////////////////////////////
// The main contract behaviour object
////////////////////////////////////////////////////////////////////////////////

const LotterySymbolGui = {};

LotterySymbolGui.setSymbolRepresentation = function (symbol) {
  $('#symbol').text(symbol);
};

LotterySymbolGui.updateSymbol = function () {
  this.contract.symbol.call().then(symbol =>
    this.setSymbolRepresentation(String.fromCharCode(symbol.toNumber()))
  );
};

LotterySymbolGui.setGuiSymbol = function (symbol) {
  $('#symbol-gui-symbol').val(symbol);
};

LotterySymbolGui.initialiseGuiSymbol = function () {
  this.contract.symbol.call()
    .then(symbol => this.setGuiSymbol(String.fromCharCode(symbol.toNumber())));
};

LotterySymbolGui.finalizeRound = function () {
  const account = Shared.selectedGasAccount();
  this.contract.finalizeRound({ from: account, gas: 60000 });
};

LotterySymbolGui.getGuiSymbol = function () {
  return $('#symbol-gui-symbol').val();
};

LotterySymbolGui.symbolIsValid = function (symbol) {
  return (symbol.length === 1) // Correct length
    && (!symbol.match(/\s/)); // Not whitespace
};

LotterySymbolGui.commitNetworkEntry = function (symbol) {
  const account = Shared.selectedGasAccount();
  this.contract.enterLottery(
    symbol.charCodeAt(0),
    { from: account,
      gas: 130000 }
  ).catch((error) => {
    console.log(error);
    alert('Something went wrong. Maybe the account doesn\'t have enough Ether to pay for gas? See the console log for details.');
  }).finally(() => Shared.hideUpdating());
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
  this.contract.currentRoundEnds.call().then(
    (currentRoundEnds) => {
      const date = new Date(currentRoundEnds * 1000);
      previous = date <= (new Date().getTime());
      let prefix = 'Next round ends at';
      if (previous) {
        prefix = 'Previous round ended at';
      }
      $('.gui-next-round').text(
        `${prefix}: ${this.pad2(date.getHours())}:${this.pad2(date.getMinutes())}:${this.pad2(date.getSeconds())} on ${date.getFullYear()}-${this.pad2(date.getMonth())}-${this.pad2(date.getDate())}`
      );
      return this.contract.numEntries.call();
    }).then(numEntries =>
            $('#gui-finalize-button').prop('disabled',
                                           ! ((numEntries > 0) && previous)));
};

LotterySymbolGui.clearCurrentEntries = function () {
  $('#gui-current-entries').empty();
};

LotterySymbolGui.renderCurrentEntries = function () {
  LotterySymbolGui.contract.getEntries.call()
    .then((entries) => {
      this.clearCurrentEntries();
      const numEntries = entries[0].length;
      if (numEntries > 0) {
        const entrants = entries[0];
        const symbols = entries[1];
        let html = '<tr><th>Entrant</th><th class="gui-current-entries-symbol">Symbol</th></tr>';
        for (var i = 0; i < numEntries; i++) {
          const entrant = entrants[i]
          const symbol = String.fromCharCode(symbols[i].toNumber());
          html += `<tr><td>${entrant}</td><td class="gui-current-entries-symbol">${symbol}</td></tr>`;
        }
        $('#gui-current-entries').append(html);
      }
    });
};

// Called from Shared, so be careful with the value of 'this'.

LotterySymbolGui.guiDisplayHook = function () {
  $('#symbol').hide();
  this.initialiseGuiSymbol();
  this.nextLotteryFinishes();
  this.guiLotteryTimer = setInterval(() => {
    this.nextLotteryFinishes();
  }, 10000);
};

LotterySymbolGui.hideGui = function () {
  Shared.hideGui();
  $('#symbol').show();
  clearInterval(this.guiLotteryTimer);
  this.guiLotteryTimer = null;
};

LotterySymbolGui.userSelectedUpdate = function (event) {
  event.stopPropagation();
  const symbol = this.getGuiSymbol();
  if (this.symbolIsValid(symbol)) {
    this.commitNetworkEntry(symbol);
    Shared.showUpdating('Entering&hellip;');
    this.hideGui();
    $('#symbol').show();
  } else {
    alert('Invalid symbol. Make sure you enter a visible character in the "Symbol" field.');
  }
};

LotterySymbolGui.userSelectedCancel = function (event) {
  event.stopPropagation();
  this.hideGui();
};

LotterySymbolGui.userSelectedFinalize = function (event) {
  event.stopPropagation();
  Shared.showUpdating('Finalizing&hellip;');
  this.hideGui();
  $('#symbol').show();
  this.finalizeRound();
};

////////////////////////////////////////////////////////////////////////////////
// Main Program Lifecycle
////////////////////////////////////////////////////////////////////////////////

LotterySymbolGui.setupGui = function () {
  $('#representation').click((event) => {
    if (!Shared.gui_is_showing) {
      Shared.showGui();
    }
  });
  $(document).keydown((event) => {
    // 27 is ESC
    if (event.keyCode === 27 && Shared.gui_is_showing) {
      this.userSelectedCancel(event);
    }
  });
  // Arrow functions so 'this' is LotterySymbolGui not the button when called
  $('#gui-update-button').click(event => this.userSelectedUpdate(event));
  $('#gui-cancel-button').click(event => this.userSelectedCancel(event));
  $('#gui-finalize-button').click(event => this.userSelectedFinalize(event));
  $('#gui-cancel-finalize-button')
    .click(event => this.userSelectedCancel(event));
  $('#gui-tabs a:first').tab('show');
  // Shared assumes a single gas select, so move it between tabs as needed
  $('a[aria-controls="enter"]').on('show.bs.tab', () => {
    $('#gui-gas-enter').append($('#gui-gas'));
    });
  $('a[aria-controls="finalize"]').on('show.bs.tab', () => {
    $('#gui-gas-finalize').append($('#gui-gas'));
    });
};

LotterySymbolGui.initialise = function () {
  Shared.init(() => this.guiDisplayHook());
  this.setupGui();
  //  Shared.setGasAccountChangedCallback(
  //    () => this.gasAccountChanged(),
  //    true
  //  );
  LotterySymbol.deployed().then((instance) => {
    this.contract = instance;
    // Race conditions between this and the event handlers
    // SO we always use renderCurrentEntries in the event handlers
    // to make sure we render the current state atomically
    this.renderCurrentEntries();
    this.contract
      .SymbolChanged({}, (error) => {
        if (!error) {
          this.renderCurrentEntries();
          this.updateSymbol();
          Shared.hideUpdating();
        }
      });
    this.contract
      .NewEntry({}, (error, event) => {
        this.renderCurrentEntries();
      });
    this.updateSymbol();
    // Silence 'a promise was created in a handler but was not returned from it'
    // resulting from all the promises created in describeArt().
    // http://bluebirdjs.com/docs/warning-explanations.html
    return null;
  });
};

$(window).on('load', () => LotterySymbolGui.initialise());
