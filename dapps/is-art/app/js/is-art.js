/*  IsArt - Ethereum contract that is or isn't art.
    Copyright (C) 2015, 2016, 2017, 2019 Rob Myers <rob@robmyers.org>

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


class IsArtDisplay {
  constructor (isArt) {
    isArt.registerStatusChangedHandler(event => this.drawRepresentation(
      isArt.hexToString(event.returnValues.is_art.toString())
    ));
  }

  drawRepresentation(status) {
    document.getElementById('is-art-status').innerText = status;
  }
}


class IsArtGui extends Gui {
  constructor (isArt) {
    super();
    this.isArt = isArt;
    this.onClickShowGui('is-art');
    this.onClickHideGui('is-art-gui-cancel');
    document
      .getElementById('is-art-gui-update')
      .onclick = async () => this.submitClickHandler();
  }

  async submitClickHandler() {
    this.hideGui();
    this.showUpdating();
    try {
      await this.isArt.blockchainToggle();
    } finally {
      this.hideUpdating();
    }
  }
}


class IsArt extends EthereumNetwork {
  async loadContracts() {
    this.isArtContract = new web3.eth.Contract(
      contract_data.abi,
      contract_data.address
    );
  }

  registerStatusChangedHandler (callback) {
    this.isArtContract.events.Status().on('data', callback);
  }

  async getIsArt() {
    return this.hexToString(await this.isArtContract.methods.is_art().call());
  }

  async blockchainToggle() {
    const account = await this.tryForAccountAccess();
    return this.isArtContract.methods.toggle().send({ from: account });
  }
};


document.addEventListener('DOMContentLoaded', async () => {
  const isArt = await new IsArt();
  isArt.initializeWeb3();
  if (! isArt.initialized) {
    document.write('Could not connect to Ethereum network');
  } else {
    await isArt.loadContracts();
    const display = new IsArtDisplay(isArt);
    const gui = new IsArtGui(isArt);
    const status = await isArt.getIsArt();
    display.drawRepresentation(status);
  }
});
