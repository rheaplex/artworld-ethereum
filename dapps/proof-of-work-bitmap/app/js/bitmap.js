/* global EthereumNetwork, Gui */
/*  bitmap.js - A bitmap updated using a proof-of-work puzzle.
    Copyright (C) 2017, 2019  Rob Myers <rob@robmyers.org>

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

const symbol = '☣';

const bitmapFromHexString = bitmapHex => {
  const bitmapBits = bitmapHex
    .slice(2)              // Strip 0x
    .match(/.{2}/g)        // Take two hex digits / one byte at a time
    .map(x => parseInt(x, 16).toString(2).padStart(8, '0').split(''));
  return [].concat(...bitmapBits);
};

const hexStringFromBitmap = bitmapArray => '0x' + bitmapArray.join('')
  .match(/.{8}/g)
  .map(x => parseInt(x, 2).toString(16).padStart(2, '0'))
  .join('');

class PixelsDisplay {
  constructor (pow) {
    pow.registerBitmapChangedHandler(event => this.drawPixelsRepresentation(
      event.returnValues.bitmap
    ));
  }

  indexForCoords (x, y) {
    return (y * 16) + x;
  }

  drawPixels (pixels, ctx, shapeFun, cellSize, on, off) {
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const value = pixels[this.indexForCoords(x, y)];
        if (value == '1') {
          ctx.fillStyle = on;
        } else {
          ctx.fillStyle = off;
        }
        const h = x * cellSize;
        const v = y * cellSize;
        shapeFun(ctx, h, v, cellSize);
      }
    }
  }

  drawRect (ctx, h, v, cellSize) {
    ctx.beginPath();
    ctx.rect(h, v, h + cellSize, v + cellSize);
    ctx.fill();
  }

  drawCircle (ctx, h, v, cellSize) {
    const radius = cellSize / 2;
    ctx.beginPath();
    ctx.arc(h + radius, v + radius, radius, 0, 2 * Math.PI, false);
    ctx.fill();
  }

  drawSymbol (ctx, h, v, cellSize) {
    ctx.font = `${cellSize}px sans`;
    ctx.fillText(symbol, h, v + cellSize);
  }

  drawPixelsRepresentation (pixelValues) {
    const canvas = document.getElementById('bitmap');
    const ctx = canvas.getContext('2d');
    canvas.width  = 1600;
    canvas.height = 1600;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.drawPixels(
      bitmapFromHexString(pixelValues),
      ctx,
      this.drawRect,
      canvas.width / 16,
      'black',
      'white'
    );
  }
}

class PixelsGui extends Gui {
  constructor (pow) {
    super();
    this.pow = pow;
    this.guiPixelValues = new Array(256).fill(0);
    this.createGuiBitmap();
    this.onClickShowGui('bitmap');
    this.onClickHideGui('bitmap-gui-cancel');
    document
      .getElementById('bitmap-gui-update')
      .onclick = () => this.submitClickHandler();
  }

  guiClickHandler (i) {
    if (this.guiPixelValues[i] == '1') {
      this.guiPixelValues[i] = '0';
    } else {
      this.guiPixelValues[i] = '1';
    }
    this.setGuiBitmapState();
  }
  
  createGuiBitmap () {
    const bitmap = document.getElementById('bitmap-gui-bitmap');
    for (let i = 0; i < 256; i++) {
      const pixel = document.createElement('div');
      pixel.className = 'bitmap-gui-pixel';
      pixel.id = `gui-pixel-${i}`;
      bitmap.appendChild(pixel);
      pixel.onclick = () => this.guiClickHandler(i);
    }
  }

  setGuiBitmapState () {
    for (let i = 0; i < 256; i++) {
      const pixel = document.getElementById(`gui-pixel-${i}`);
      if (this.guiPixelValues[i] == '1') {
        pixel.classList.add('bitmap-gui-pixel-on');
      } else {
        pixel.classList.remove('bitmap-gui-pixel-on');
      }
    }
  }
  
  async showGui () {
    const bitmapHex = await this.pow.getBitmap();
    this.guiPixelValues = bitmapFromHexString(bitmapHex);
    this.setGuiBitmapState();
    super.showGui();
  }

  async submitClickHandler () {
    this.hideGui();
    this.showUpdating();
    const bitmapHex = hexStringFromBitmap(this.guiPixelValues);
    const [newHash, newNonce] = await this.pow.calculatePow(bitmapHex);
    // Make sure we hide the updating overlay regardless of whether the
    // user approves the transaction or not.
    try {
      await this.pow.setBlockchainBitmap(bitmapHex, newHash, newNonce);
    } finally {
      this.hideUpdating();
    }
  }
}

class ProofOfWorkPixels extends EthereumNetwork {
  async loadContracts() {
    this.pixelsContract = await this.loadContract(
      '../build/contracts/ProofOfWorkBitmap.json'
    );
  }

  registerBitmapChangedHandler (callback) {
    this.pixelsContract.events.BitmapChanged().on('data', callback);
  }

  _calculatePow (previousHash, bitmap, difficulty) {
    const one = web3.utils.toBN('1');
    const zeros = '0'.repeat(difficulty * 2);
    let nonce = web3.utils.toBN(1);
    let digest;
    for(;; nonce = nonce.add(one)) {
      digest = web3.utils.soliditySha3(
        {t: 'bytes32', v: previousHash},
        {t: 'bytes32', v: bitmap},
        {t: 'uint256', v: nonce}
      );
      if (digest.endsWith(zeros)) {
        break;
      }
    }
    return [digest, `0x${nonce.toString('hex')}`];
  }

  async getBitmap () {
    return await this.pixelsContract.methods.bitmap().call();
  }

  async calculatePow (bitmapHex) {
    const previousHash = await this.pixelsContract.methods.hash().call();
    const difficulty = await this.pixelsContract.methods.difficulty().call();
    return this._calculatePow(
      previousHash,
      bitmapHex,
      difficulty
    );
  }

  async setBlockchainBitmap(bitmapHex, newHash, newNonce) {
    const account = await this.tryForAccountAccess();
    return this.pixelsContract.methods.setBitmap(
      bitmapHex,
      newNonce,
      newHash
    ).send({from: account});
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const pow = await new ProofOfWorkPixels();
  pow.initializeWeb3();
  if (! pow.initialized) {
    document.write('Could not connect to Ethereum network');
  } else {
    await pow.loadContracts();
    const display = new PixelsDisplay(pow);
    const gui = new PixelsGui(pow);
    //TODO: LISTEN TO PIXEL EVENTS
    const bitmap = await pow.getBitmap();
    display.drawPixelsRepresentation(bitmap);
  }
});
