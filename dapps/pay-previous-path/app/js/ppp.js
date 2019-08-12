/*  Hack Line Properties - Line stroke properties.
    Copyright (C) 2019 Rhea Myers <rob@Rhea Myers.org>

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


const pathSpecToD = (spec) => {
  let d = [];
  for(let i = 0; i < 32; i++) {
    const commandSpec = parseInt(spec.command[i]);
    if (commandSpec === 0) {
      break;
    }
    // Lower 4 bits identify drawing commands
    const command = commandSpec & 0x0F;
    // Bit 6 identifies relative commands
    const relative = spec.command[i] & 64;
    // Bit 7 allows us to add a closespec after the command
    const closepath = spec.command[i] & 128; 
    switch(command) {
    case 1:
      d.push(`${relative? 'm' : 'M'} ${spec.x[i]} ${spec.y[i]}`);
      break;
    case 2:
      d.push(`${relative? 'l' : 'L'} ${spec.x[i]} ${spec.y[i]}`);
      break;
    case 3:
      d.push(`${relative? 'c' : 'C'} ${spec.x1[i]} ${spec.y1[i]} ${spec.x2[i]} ${spec.y2[i]} ${spec.x[i]} ${spec.y[i]}`);
      break;
    }
    if (closepath) {
      d.push(' Z');
    }
  }
  return d.join(' ');
};

// Handrolled parser with regexes antipattern

const ensureInt = (i) => {
  if(isNaN(i)) {
    throw new Error(`Not a number: ${i}`);
  }
  let val = parseInt(i);
  // Clamp to range of signed 8-bit integer
  if (val > 127) {
    val = 127;
  } else if (val < -128) {
    val = -128;
  }
  return val;
};

const dToPathSpec = (d) => {
  const spec = {
    command: new Array(32).fill(0),
    x1: new Array(32).fill(0),
    y1: new Array(32).fill(0),
    x2: new Array(32).fill(0),
    y2: new Array(32).fill(0),
    x: new Array(32).fill(0),
    y: new Array(32).fill(0),
  };
  const tokens = d.match(/([a-zA-Z]|-?[0-9.]+)/g).reverse();
  let index = 0;
  while(tokens.length > 0 && index < 32) {
    const command = tokens.pop();
    if(! isNaN(command)) {
      throw new Error(`Not a command: ${command}`);
    }
    switch(command) {
    case 'Z':
    case 'z':
      if (index > 0) {
        spec.command[index] |= 128;
      }
      break;
    case 'M':
      if(tokens.length < 2) {
        throw new Error(`Too few numbers for M`);
      }
      spec.command[index] = 1;
      spec.x[index] = ensureInt(tokens.pop());
      spec.y[index] = ensureInt(tokens.pop());
      index++;
      break;
    case 'm':
      if(tokens.length < 2) {
        throw new Error(`Too few numbers for m`);
      }
      spec.command[index] = 129;
      spec.x[index] = ensureInt(tokens.pop());
      spec.y[index] = ensureInt(tokens.pop());
      index++;
      break;
    case 'L':
      if(tokens.length < 2) {
        throw new Error(`Too few numbers for L`);
      }
      spec.command[index] = 2;
      spec.x[index] = ensureInt(tokens.pop());
      spec.y[index] = ensureInt(tokens.pop());
      index++;
      break;
    case 'L':
      if(tokens.length < 2) {
        throw new Error(`Too few numbers for L`);
      }
      spec.command[index] = 130;
      spec.x[index] = ensureInt(tokens.pop());
      spec.y[index] = ensureInt(tokens.pop());
      index++;
      break;
    case 'C':
      if(tokens.length < 6) {
        throw new Error(`Too few numbers for C`);
      }
      spec.command[index] = 3;
      spec.x1[index] = ensureInt(tokens.pop());
      spec.y1[index] = ensureInt(tokens.pop());
      spec.x2[index] = ensureInt(tokens.pop());
      spec.y2[index] = ensureInt(tokens.pop());
      spec.x[index] = ensureInt(tokens.pop());
      spec.y[index] = ensureInt(tokens.pop());
      index++;
      break;
    case 'c':
      if(tokens.length < 6) {
        throw new Error(`Too few numbers for c`);
      }
      spec.command[index] = 131;
      spec.x1[index] = ensureInt(tokens.pop());
      spec.y1[index] = ensureInt(tokens.pop());
      spec.x2[index] = ensureInt(tokens.pop());
      spec.y2[index] = ensureInt(tokens.pop());
      spec.x[index] = ensureInt(tokens.pop());
      spec.y[index] = ensureInt(tokens.pop());
      index++;
      break;
    }
  }
  return spec;
};


class PathDisplay {
  constructor (path) {
    this.path = path;
    this.path.registerPathChangedHandler(
      this.drawPathRepresentationEvent.bind(this)
    );
  }

  drawPathRepresentationEvent (event) {
    const d = pathSpecToD(event.returnValues);
    this.drawPathRepresentation(d);
  }

  drawPathRepresentation (d) {
    document.getElementById('path').setAttribute('d', d);
  }
}

class PathGui extends Gui {
  constructor (path) {
    super();
    this.path = path;
    this.spec = {};
    this.onClickShowGui('representation');
    this.onClickHideGui('path-gui-cancel');
    document.getElementById('path-gui-update')
      .onclick = this.submitClickHandler.bind(this);
    document.getElementById('path-gui-d')
      .addEventListener('input', this.setFromD.bind(this));
    document.getElementById('path-gui-claim-payment')
      .onclick = this.claimClickHandler.bind(this);
  }

  // super.showGui() isn't async, but that's OK

  async showGui () {
    const spec = await this.path.getBlockchainPath();
    this.spec = spec;
    document.getElementById('path-gui-d').value = pathSpecToD(this.spec);
    document.getElementById('path-gui-d-error').innerText = '';
    this.drawPathRepresentation();
    const payments = await this.path.getPaymentBalance();
    if (payments > 0) {
      document.getElementById('path-gui-claim-amount')
        .innerText = web3.utils.fromWei(payments, 'ether');
      document.getElementById('path-gui-claim').classList.remove('is-hidden');
    } else {
      document.getElementById('path-gui-claim').classList.add('is-hidden');
    }
    super.showGui();
  }

  setFromD () {
    const dField = document.getElementById('path-gui-d');
    const dIn = dField.value;
    try {
      this.spec = dToPathSpec(dIn);
      dField.value = pathSpecToD(this.spec);
      this.drawPathRepresentation();
      document.getElementById('path-gui-d-error').innerText = '';
    } catch (e) {
      document.getElementById('path-gui-d-error').innerText = e.message;
    }
  }
  
  async submitClickHandler () {
    this.hideGui();
    this.showUpdating();
    try {
      await this.path.setBlockchainPath(this.spec);
    } catch (e) {
      //FIXME: ERROR, BUT NOT IF USER CANCELLED
    } finally {
      this.hideUpdating();
    }
  }

    async claimClickHandler () {
    this.hideGui();
    this.showUpdating();
    try {
      await this.path.blockchainWithdrawPayments();
    } catch (e) {
      //FIXME: ERROR, BUT NOT IF USER CANCELLED
    } finally {
      this.hideUpdating();
    }
  }

  drawPathRepresentation () {
    const d = pathSpecToD(this.spec);
    document.getElementById('path-gui-path').setAttribute('d', d);
  }
}

class PayPreviousPath extends EthereumNetwork {
  async loadContracts() {
    this.pathContract = await this.loadContract(
      '../build/contracts/PayPreviousPath.json'
    );
  }

  async getBlockchainPath () {
    return this.pathContract.methods.getPath().call();
  }

  async setBlockchainPath (spec) {
    const account = await this.tryForAccountAccess();
    const gasPrice = await web3.eth.getGasPrice();
    const fee = await this.pathContract.methods.calculateFee(gasPrice).call();
    return this.pathContract.methods.setPath(
      spec.command,
      spec.x1,
      spec.y1,
      spec.x2,
      spec.y2,
      spec.x,
      spec.y
    ).send({
      from: account,
      value: fee,
      gasPrice: gasPrice
    });
  }

  async getPaymentBalance () {
    const account = await this.tryForAccountAccess();
    this.accountWeArePaying = account;
    return this.pathContract.methods.payments(account).call();
  }

  async blockchainWithdrawPayments () {
    const account = await this.tryForAccountAccess();
    if (account != this.accountWeArePaying) {
      alert("Account mismatch. Don't change account when trying to claim payments.");
      return;
    }
    this.pathContract.methods
      .withdrawPayments(this.accountWeArePaying)
      .send({ from: this.accountWeArePaying });
    delete this.accountWeArePaying;
  }
  
  registerPathChangedHandler (callback) {
    this.pathContract.events.PathChanged().on('data', callback);
  }
}

////////////////////////////////////////////////////////////////////////////////
// Lifecycle
////////////////////////////////////////////////////////////////////////////////

document.addEventListener('DOMContentLoaded', async () => {
  const path = new PayPreviousPath();
  path.initializeWeb3();
  if (! path.initialized) {
    document.write('Could not connect to Ethereum network');
  } else {
    await path.loadContracts();
    const display = new PathDisplay(path);
    const gui = new PathGui(path);
    const d = pathSpecToD(await path.getBlockchainPath());
    display.drawPathRepresentation(d);
  }
});
