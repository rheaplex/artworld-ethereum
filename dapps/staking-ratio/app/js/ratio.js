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


const calculateAWidth = (a, b, backgroundWidth) => {
  let aWidth;
  if (b == 0) {
    aWidth = backgroundWidth / 2;
  } else {
    // Wei per eth, our scale for the interger math we are doing here
    const total = a + b;
    aWidth = (backgroundWidth / total) * a;
    console.log([a, b, backgroundWidth, total, aWidth]);
  }
  // Always at least one pixel wide
  return Math.max(aWidth, 1);
};

const wei2Ethf = wei => parseFloat(web3.utils.fromWei(wei));

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

  async drawRatio () {
    const a = wei2Ethf(await this.ratio.getStake('A'));
    const b = wei2Ethf(await this.ratio.getStake('B'));
    this._drawRatio(a, b);
  }

  async drawRatioEvent (event) {
    const a = wei2Ethf(event.returnValues.a);
    const b = wei2Ethf(event.returnValues.b);
    this._drawRatio(a, b);
  }
}


class StakingRatio extends EthereumNetwork {
  async loadContracts() {
    this.ratioContract = await this.loadContract(
      '../build/contracts/StakingRatio.json'
    );
  }

  async getStake (which) {
    const account = await this.tryForAccountAccess();
    let amount;
    switch (which) {
    case 'A':
      amount = web3.utils.toBN(
        await this.ratioContract.methods.myAStake().call({ from: account })
      );
      break;
    case 'B':
      amount = web3.utils.toBN(
        await this.ratioContract.methods.myBStake().call({ from: account })
      );
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
    return amount;
  }

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
      throw(new Error(`Unknown getStake() spec: ${which}`));
    }
    return amount;
  }
  
  registerRatioChangedHandler (callback) {
    this.ratioContract.events.Ratio().on('data', callback);
  }
}


class RatioGui extends Gui {
  constructor (ratio) {
    super();
    this.ratio = ratio;
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

  selectTab (tabClass, tabId) {
    Array.prototype.forEach.call(
      document.getElementsByClassName(tabClass),
      item => item.classList.remove('is-active')
    );
    document.getElementById(tabId).classList.add('is-active');
  }

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

  async selectStake (which) {
    Array.prototype.forEach.call(
      document.getElementsByClassName('stake-add-to'),
      item => item.textContent = which
    );
    const amount = await this.ratio.getStake(which);
    document.getElementById(
      'stake-current-amount'
    ).innerText = web3.utils.fromWei(amount, 'ether');
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
    let a = parseFloat(
      web3.utils.fromWei(await this.ratio.getStake('A'), 'ether')
    );
    let b = parseFloat(
      web3.utils.fromWei(await this.ratio.getStake('B'), 'ether')
    );
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

  async selectWithdraw (which) {
    Array.prototype.forEach.call(
      document.getElementsByClassName('withdraw-from'),
      item => item.textContent = which
    );
    const amount = await this.ratio.getStake(which);
    document.getElementById('withdraw-balance')
      .innerText = web3.utils.fromWei(amount, 'ether');
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
