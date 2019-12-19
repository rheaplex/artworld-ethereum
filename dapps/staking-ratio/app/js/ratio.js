/*  Staking Ratio - A ratio.
    Copyright (C) 2017,2019 Rhea Myers <rob@Rhea Myers.org>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

////////////////////////////////////////////////////////////////////////////////
// Utility functions
////////////////////////////////////////////////////////////////////////////////

// Calculate the width of a in [ A     |  B ] .
// a and b are Ether amounts as JS floats.

const calculateAWidth = (a, b, backgroundWidth) => {
  let aWidth;
  if (a == 0 && b == 0) {
    aWidth = backgroundWidth / 2;
  } else if (a == 0) {
    aWidth = 0;
  } else if (b == 0) {
    aWidth = backgroundWidth;
  } else {
    // Wei per eth, our scale for the interger math we are doing here
    const total = a + b;
    aWidth = (backgroundWidth / total) * a;
  }
  return aWidth;
};

// Convert a string wei value to an Ether amount as a JS float.

const wei2Ethf = wei => parseFloat(web3.utils.fromWei(wei));


////////////////////////////////////////////////////////////////////////////////
// Display class
////////////////////////////////////////////////////////////////////////////////

class RatioDisplay {
  constructor (ratio) {
    this.ratio = ratio;
    this.ratio.registerRatioChangedHandler(
      this.drawRatioEvent.bind(this)
    );
  }

  _drawRatio (a, b) {
    const backgroundWidth = document.getElementById(
      'ratio-background'
    ).offsetWidth;
    let aWidth = calculateAWidth(a, b, backgroundWidth);
    document.getElementById('ratio-area-a').style.width = `${aWidth}px`;
  }

  // Draw the ratio by fetching the values from web3.
  // We should cache these values but we don't.

  async drawRatio () {
    const a = await this.ratio.getTotal('A');
    const b = await this.ratio.getTotal('B');
    this._drawRatio(a, b);
  }

  // Draw the ratio in response to an event coming in.

  async drawRatioEvent (event) {
    const a = wei2Ethf(event.returnValues.a);
    const b = wei2Ethf(event.returnValues.b);
    this._drawRatio(a, b);
  }
}


////////////////////////////////////////////////////////////////////////////////
// Smart contract / network handling.
////////////////////////////////////////////////////////////////////////////////

class StakingRatio extends EthereumNetwork {
  async loadContracts() {
    this.ratioContract = await this.loadContract(
      '../build/contracts/StakingRatio.json'
    );
  }

  // Add additional Ether stake to A or B from the current account.

  async getTotal (which) {
    let total;
    switch (which) {
    case 'A':
      total = await this.ratioContract.methods.totalAmountA().call();
      break;
    case 'B':
      total = await this.ratioContract.methods.totalAmountB().call();
      break;
    default:
      throw(new Error(`Unknown addStake() spec: ${which}`));
    }
    return wei2Ethf(total);
  }

  // Fetch the current account's staked value amount(s).

  async getStake (which) {
    const account = await this.tryForAccountAccess();
    let amount;
    switch (which) {
    case 'A':
      amount = await this.ratioContract.methods.myAStake().call({
        from: account
      });
      break;
    case 'B':
      amount = await this.ratioContract.methods.myBStake().call({
        from: account
      });
      break;
    case 'combined':
      amount = web3.utils.toBN(
        await this.ratioContract.methods.myAStake().call({ from: account })
      );
      amount = amount.add(web3.utils.toBN(
        await this.ratioContract.methods.myBStake().call({ from: account })
      ));
      break;
    default:
      throw(new Error(`Unknown getStake() spec: ${which}`));
    }
    return wei2Ethf(amount);
  }

  // Add additional Ether stake to A or B from the current account.

  async addStake (which, amount) {
    const account = await this.tryForAccountAccess();
    switch (which) {
    case 'A':
      await this.ratioContract.methods.stakeA().send({
        from: account,
        value: amount
      });
      break;
    case 'B':
      await this.ratioContract.methods.stakeB().send({
        from: account,
        value: amount
      });
      break;
    default:
      throw(new Error(`Unknown addStake() spec: ${which}`));
    }
  }

  // Withdraw either or both of the current user's stakes.

  async withdrawStake (which) {
    const account = await this.tryForAccountAccess();
    let amount;
    switch (which) {
    case 'A':
      await this.ratioContract.methods.withdrawA().send({ from: account });
      break;
    case 'B':
      await this.ratioContract.methods.withdrawB().send({ from: account });
      break;
    case 'combined':
      await this.ratioContract.methods.withdrawAll().send({ from: account });
      break;
    default:
      throw(new Error(`Unknown withdrawStake() spec: ${which}`));
    }
    return amount;
  }
  
  registerRatioChangedHandler (callback) {
    this.ratioContract.events.Ratio().on('data', callback);
  }
}


////////////////////////////////////////////////////////////////////////////////
// The state manipulation GUI for the ratio.
////////////////////////////////////////////////////////////////////////////////

class RatioGui extends Gui {
  constructor (ratio) {
    super();
    this.ratio = ratio;
    // Register lots of event handlers...
    this.onClickShowGui('representation');
    this.onClickHideGui('staking-gui-stake-cancel');
    this.onClickHideGui('staking-gui-withdraw-cancel');
    document.getElementById('update-ratio-trigger').addEventListener(
      'click',
      this.selectStakeTab.bind(this)
    );
    document.getElementById('withdraw-stake-trigger').addEventListener(
      'click',
      this.selectWithdrawTab.bind(this)
    );
    // Stake pane
    document.getElementById('stake-select-a-button').addEventListener(
      'click',
      this.selectStakeA.bind(this)
    );
    document.getElementById('stake-select-b-button').addEventListener(
      'click',
      this.selectStakeB.bind(this)
    );
    document.getElementById('stake-amount-to-send').addEventListener(
      'input',
      this.updateStakeRatioPreview.bind(this)
    );
    document.getElementById('staking-gui-add-stake').addEventListener(
      'click',
      this.addStake.bind(this)
    );
    // Withdraw pane
    document.getElementById('withdraw-select-a-button').addEventListener(
      'click',
      this.selectWithdrawA.bind(this)
    );
    document.getElementById('withdraw-select-both-button').addEventListener(
      'click',
      this.selectWithdrawBoth.bind(this)
    );
    document.getElementById('withdraw-select-b-button').addEventListener(
      'click',
      this.selectWithdrawB.bind(this)
    );
    document.getElementById('staking-gui-withdraw-stake').addEventListener(
      'click',
      this.withdrawStake.bind(this)
    );
  }

  async showGui () {
    super.showGui();
    this.selectStakeTab();
    await this.selectStakeA();
    // We don't display this immediately, but we need it ready for when the
    // user chooses it.
    await this.selectWithdrawA();
    await this.updateStakeRatioPreview();
  }

  // Select a top-level tab for a pane.
  
  selectTab (tabClass, tabId) {
    Array.prototype.forEach.call(
      document.getElementsByClassName(tabClass),
      item => item.classList.remove('is-active')
    );
    document.getElementById(tabId).classList.add('is-active');
  }

  // Display the content for a tab pane.

  selectContent(contentClass, contentId) {
    Array.prototype.forEach.call(
      document.getElementsByClassName(contentClass),
      item => item.style.display= 'none'
    );
    document.getElementById(contentId).style.display = 'block';
  }

  selectStakeTab () {
    this.selectTab('gui-tab', 'gui-tab-stake');
    this.selectContent('tab-pane', 'tab-pane-stake');
  }

  selectWithdrawTab () {
    this.selectTab('gui-tab', 'gui-tab-withdraw');
    this.selectContent('tab-pane', 'tab-pane-withdraw');
  }

  // Called in response to selecting the A/B tabs within the Select pane
  // to select A or B as the stake to add Ether to.

  async selectStake (which) {
    Array.prototype.forEach.call(
      document.getElementsByClassName('stake-add-to'),
      item => item.textContent = which
    );
    const amount = await this.ratio.getStake(which);
    document.getElementById('stake-current-amount').innerText = amount;
    document.getElementById('stake-amount-to-send').value = '';
    this.stakeSelected = which;
    await this.updateStakeRatioPreview();
  }

  async selectStakeA () {
    this.selectTab('stake-select', 'stake-select-a');
    await this.selectStake('A');
  }

  async selectStakeB () {
    this.selectTab('stake-select', 'stake-select-b');
    await this.selectStake('B');
  }

  // Dynamically update the preview as the user enters an amount to add to
  // their stake.
  // Note that this will not result in an update if A or B are zero given the
  // behaviour of calculateAWidth.

  async updateStakeRatioPreview () {
    const previewBackgroundWidth = web3.utils.toBN(
      document.getElementById(
        'ratio-gui-preview-ratio-background'
      ).offsetWidth
    );
    const additionalValue = parseFloat(
      document.getElementById('stake-amount-to-send').value
        || '0'
    );
    let a = await this.ratio.getTotal('A');
    let b = await this.ratio.getTotal('B');
    if (this.stakeSelected === 'A') {
      a += additionalValue;
    } else {
      b += additionalValue;
    }
    const aWidth = calculateAWidth(a, b, previewBackgroundWidth);
    document.getElementById(
      'ratio-gui-preview-ratio-area-a'
    ).style.width = `${aWidth}px`;
  }

  // Called in response to selecting the A/Both/B tabs within the Withdraw pane
  // to select A, Both or B as the stake to withdraw.

  async selectWithdraw (which) {
    Array.prototype.forEach.call(
      document.getElementsByClassName('withdraw-from'),
      item => item.textContent = which
    );
    const amount = await this.ratio.getStake(which);
    document.getElementById('withdraw-balance').innerText = amount;
    this.withdrawSelected = which;
  }

  async selectWithdrawA () {
    this.selectTab('withdraw-select', 'withdraw-select-a');
    await this.selectWithdraw('A');
  }

  async selectWithdrawB () {
    this.selectTab('withdraw-select', 'withdraw-select-b');
    await this.selectWithdraw('B');
  }

  async selectWithdrawBoth () {
    this.selectTab('withdraw-select', 'withdraw-select-both');
    await this.selectWithdraw('combined');
  }

  // Add stake to X button event handler.

  async addStake () {
    this.showUpdating();
    this.hideGui();
    const amount = document.getElementById('stake-amount-to-send').value;
    try {
      await this.ratio.addStake(
        this.stakeSelected,
        web3.utils.toWei(amount, 'ether')
      );
    } catch (e) {
      console.log(e);
    } finally {
      this.hideUpdating();
    }
  }

  // Withdraw this amount button.

  async withdrawStake () {
    this.showUpdating();
    this.hideGui();
    try {
      await this.ratio.withdrawStake(this.withdrawSelected);
    } catch (e) {
      console.log(e);
    } finally {
      this.hideUpdating();
    }
  }
}


////////////////////////////////////////////////////////////////////////////////
// Lifecycle
////////////////////////////////////////////////////////////////////////////////

document.addEventListener('DOMContentLoaded', async () => {
  const ratio = new StakingRatio();
  ratio.initializeWeb3();
  if (! ratio.initialized) {
    document.write('Could not connect to Ethereum network');
  } else {
    await ratio.loadContracts();
    const display = new RatioDisplay(ratio);
    const gui = new RatioGui(ratio);
    await display.drawRatio();
  }
});
