/*  Bitmap - A bitmap.
    Copyright (C) 2017  Rhea Myers <rob@Rhea Myers.org>

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


const symbol = '☣'

class PixelsDisplay {
  indexForCoords (x, y) {
    return (y * 16) + x
  }
  
  drawPixels (pixels, ctx, shapeFun, cellSize, on, off) {
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const value = pixels[this.indexForCoords(x, y)]
        if (value == '1') {
          ctx.fillStyle = on
        } else {
          ctx.fillStyle = off
        }
        const h = x * cellSize
        const v = y * cellSize
        shapeFun(ctx, h, v, cellSize)
      }
    }
  }

  drawRect (ctx, h, v, cellSize) {
    ctx.beginPath()
    ctx.rect(h, v, h + cellSize, v + cellSize)
    ctx.fill()
  }

  drawCircle (ctx, h, v, cellSize) {
    const radius = cellSize / 2
    ctx.beginPath()
    ctx.arc(h + radius, v + radius, radius, 0, 2 * Math.PI, false)
    ctx.fill()
  }

  drawSymbol (ctx, h, v, cellSize) {
    ctx.font = "" + cellSize + "px sans"
    ctx.fillText(symbol, h, v + cellSize)
  }

  drawPixelsRepresentation (pixelValues) {
    const canvas = document.getElementById("#bitmap")
    const ctx = canvas.getContext("2d")
    canvas.width  = 1600
    canvas.height = 1600
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    drawPixels(pixelValues, ctx, drawSymbol, canvas.width / 16, 'black',
               'white')
  }
}

class PixelsGui {
  constructor (pixelsContract) {
    this.pixelsContract = pixelsContract
    this.guiPixelValues = undefined
  }
    
  guiClickHandler (i) {
    return function () {
      if (this.guiPixelValues[i] == "1") {
        this.guiPixelValues[i] = "0"
      } else {
        this.guiPixelValues[i] = "1"
      }
      this.setGuiBitmapState()
    }
  }
  
  createGuiBitmap () {
    const bitmap = document.getElementById("#bitmap-gui-bitmap")
    for (let i = 0; i < 256; i++) {
      const id = "gui-pixel-" + i
      pixel = document.createElement('<div id="'
                                     + id
                                     + '" class="bitmap-gui-pixel"></div>')
      bitmap.appendChild(pixel)
      pixel.on('click', this.guiClickHandler(i))
    }
  }

  setGuiBitmapState () {
    const bitmap = document.getElementById("#bitmap-gui-bitmap")
    for (let i = 0; i < 256; i++) {
      const pixel = document.getElementById("#gui-pixel-" + i)
      if (this.guiPixelValues[i] == "1") {
        pixel.addClass("bitmap-gui-pixel-on")
      } else {
        pixel.removeClass("bitmap-gui-pixel-on")
      }
    }
  }
  
  async guiDisplayHookFun () {
    const bitmapHex = await pixelsContract.getBitmap()
    this.guiPixelValues = this.bitmapFromHexString(bitmapHex)
    this.setGuiBitmapState()
  }

  bitmapFromHexString (bitmapHex) {
    const bitmapBits = bitmapHex
          .match(/.{2}/g)
          .map(x => parseInt(x, 16).toString(2).split(''))
    return [].concat(...bitmapBits)
  }

  hexStringFromBitmap (bitmapArray) {
    bitmapArray.join('')
      .match(/.{8}/g)
      .map(x => parseInt(x, 2).toString(16))
      .join('')
  }

}

class ProofOfWorkPixels is EthereumContractAccessor {
  constructor () {
    this.initializeWeb3()
    if (this.initialized) {
      this.pixelsContract = this.loadContract('../build/contracts/ProofOfWorkPixels.js')
    } else {
      // TELL USER
    }
  }
  
  async getBitmap () {
    return (await this.pixelsContract.bitmap()).toString()
  }

  async setBitmap (bitmap, nonce, hash) {
    return await this.pixelsContract.setBitmap(bitmap, nonce, hash)
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const connection = new Web3Connection()
  connection.initializeWeb3()
  if (! connection.initialized) {
    document.write('Could not connect to Ethereum network')
  } else {
    const pixels = new ProofOfWorkPixels()
    const display = new PixelsDisplay(pixels)
    const gui = new PixelsGui(pixels)
    gui.createGuiBitmap()
    //TODO: LISTEN TO PIXEL EVENTS
    const pixels = await pixels.getPixels()
    display.drawPixelsRepresentation()
  }
}
