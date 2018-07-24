const Data = {};

Data.properties = {
  'secret property of': 'its content',

  'hash of the content of': '0x242F21E612C260AC18187601798295E6C4576617E4EA8CE823902531C0044B35',
  
  'Ethereum address of the contract containing': '0x5B64319F093178A5DB00BAB4B274B1E665A66ECE',

  'Ethereum address of the creator of the contract containing': '0x7B227BB88E79284A3B21C723789E18FC5503B452',
  'Ethereum block containing the transaction creating the contract containing': '0xCC7D4703E8B229BF5804E7D6EFFC58B05FB34410B540D0A83372A9D28EE037F3',
  'Ethereum transaction creating the contract containing': '0x208722F6308E444626E438D37361365E63B02BEB770343022CAB2C714AFC8D91',
  
  'Ethereum block containing the transaction setting the content of': '0xFCFEFC0D8B031FFCD55A3F2E834DA996D979826EB3C708611A06470958C14497',
  'Ethereum transaction setting the content of': '0x7BA23D2138563D447D31B02D271FDCF3362F20488125756D58828ED2E654373C',
  
  'Ethereum address of the owner of': '0x7B227BB88E79284A3B21C723789E18FC5503B452',
  'Ethereum block containing the transaction setting the current owner of': '0xCC7D4703E8B229BF5804E7D6EFFC58B05FB34410B540D0A83372A9D28EE037F3',
  'Ethereum transaction setting the current owner of': '0x208722F6308E444626E438D37361365E63B02BEB770343022CAB2C714AFC8D91',
}

const SIXTEEN_COLORS = [
  '#F0F0F0', 'silver', 'gray', 'black', 'red', 'maroon', 'yellow', 'olive',
  'lime', 'green', 'aqua', 'teal', 'blue', 'navy', 'fuschia', 'purple'
]

const SIXTEEN_GRAYS = [
  '#000', '#111', '#222', '#333', '#444', '#555', '#666', '#777',
  '#888', '#999', '#AAA', '#BBB', '#CCC', '#DDD', "#EEE", '#F0F0F0'
]

const SIXTEEN_SHAPES = ['⯀','⯁','⯂','⯃','⯄','⯅','◢','◣','◤','◥','◖','◗','⯊','⯋','▮','●']

const SIXTEEN_DINGBATS = ['🙐','🙑','🙒','🙓','🙔','🙕','🙖','🙗','🙘','🙙','🙚','🙛','🙜','🙝','🙞','🙟']

const SIXTEEN_EMOJI = ['😐','😑','😒','😓','😔','😕','😖','😗','😘','😙','😚','😛','😜','😝','😞','😟']

const SIXTEEN_NOTES = ['🎜','🎝','♪','♫','♬','𝅜','𝅝','𝅗𝅥','𝅘𝅥','𝅘𝅥𝅮','𝅘𝅥𝅯','𝅘𝅥𝅰','𝅘𝅥𝅱','𝅘𝅥𝅲','𝆔','𝆕']

Data.valueReps = [
  // Just the string
  function (string, int8s, nibbles) {
    return string.startsWith('0x') ? `<span style="font-family: Courier New,Courier,Nimbus Mono L, Lucida Sans Typewriter,Lucida Typewriter,monospace;">${string}</span>`: `<span style="font-family: Times Roman, Times New Roman,serif;">${string}</span>`
  },
  // Colored boxes
  function (string, int8s, nibbles) {
    return nibbles.map(val => `<span style="background-color: ${SIXTEEN_COLORS[val]};">&#x2001;</span>`).join('')
  },
  // Gray boxes
  function (string, int8s, nibbles) {
    return nibbles.map(val => `<span style="background-color: ${SIXTEEN_GRAYS[val]};">&#x2001;</span>`).join('')
  },
  // Colored blobs
  function (string, int8s, nibbles) {
    return nibbles.map(val => `<span style="color: ${SIXTEEN_COLORS[val]};">&#x2B24;</span>`).join('')
  },
  // Gray blobs
  function (string, int8s, nibbles) {
    return nibbles.map(val => `<span style="color: ${SIXTEEN_GRAYS[val]};">&#x2B24;</span>`).join('')
  },
  // Shapes
  function (string, int8s, nibbles) {
    return nibbles.map(val => `${SIXTEEN_SHAPES[val]}`).join('')
  },
  // Dingbats - Unreliable on Debian :-(
  function (string, int8s, nibbles) {
    return nibbles.map(val => `${SIXTEEN_DINGBATS[val]}`).join('')
  },
  // Emoji
  function (string, int8s, nibbles) {
    return nibbles.map(val => `${SIXTEEN_EMOJI[val]}`).join('')
  },
  // Musical Notes
  function (string, int8s, nibbles) {
    return nibbles.map(val => `${SIXTEEN_NOTES[val]}`).join('')
  },
  // Different sized circles
  function (string, int8s, nibbles) {
    return '<span class="valign-content">' + nibbles.map(val => `<span style="font-size: ${val + 1}pt;">&xcirc;</span>`).join('') + '</span>'
  },
  // Different sized squares
  function (string, int8s, nibbles) {
    return '<span class="valign-content">' + nibbles.map(val => `<span style="font-size: ${val + 4}pt;">&#x25A1;</span>`).join('') + '</span>'
  },
]

Data.toInt8s = function (property) {
  let bytes = []
  if (property.startsWith('0x')) {
    for (let i = 2; i < property.length; i += 2) {
      bytes.push(parseInt(property.slice(i, i + 2), 16))
    }
  } else {
    for (let i = 0; i < property.length; i++) {
      bytes.push(property.charCodeAt(i))
    }
  }
  return bytes
}

Data.toNibbles = function (byteBits) {
  let nibbles = []
  for (let i = 0; i < byteBits.length; i++) {
    nibbles.push(byteBits[i] & 0xF)
    nibbles.push(byteBits[i] >> 4)
  }
  return nibbles
}

Data.randomPropertyName = function () {
  const names = Object.keys(this.properties)
  return names[Math.floor(Math.random() * names.length)]
}

Data.repName = function (name) {
  return `<p class="fact-title"><strong>${name} this artwork</strong></p>`
}

Data.repValueRandomly = function (name) {
  const value = this.properties[name]
  const int8s = this.toInt8s(value)
  const nibbles = this.toNibbles(int8s)
  const fun = this.valueReps[Math.floor(Math.random() * this.valueReps.length)]
  return fun(value, int8s, nibbles)
}

Data.repRandomProperty = function () {
  const name = this.randomPropertyName()
  const rep = Data.repValueRandomly(name)
  return this.repName(name) + `<p class="fact-value">${rep}</p>`
}

const Secret = {};

Secret.UPDATE_AT_LEAST_EVERY = 4

Secret.updating = false
Secret.lastUpdateAt = 0

Secret.init = function() {
  this.reveal = $('#reveal')
  this.revealBottom = this.elementBottom(this.reveal)
  this.appendInitialPaddingRows()
}

Secret.shouldUpdate = function(timestamp) {
  return (((timestamp - this.lastUpdateAt) / 1000) > this.UPDATE_AT_LEAST_EVERY)
    && (! this.updating)
}

Secret.elementBottom = function(element) {
  return element.offset().top
    + element.outerHeight(true)
}

/*Secret.revealOverflow = function() {
  return this.elementBottom($('.fact').last()) - this.revealBottom
}*/

Secret.removeOverflowFactRows = function() {
  const topFact = $('.fact').first()
  const bottomFact = $('.fact').last()
  const excess = (topFact.outerHeight(true))
  this.updating = true
  const that = this
  topFact.animate({'margin-top': `-${excess}`},
                  1000,
                  () => {
                    that.updating = false
                    topFact.remove()
                  })
}

Secret.appendFactRow = function(content) {
  let overflowed = false
  const fact = $(`<div class="fact">${content}</div>`)
        .appendTo(this.reveal)
  const factTop = fact.position().top
  if (factTop > this.revealBottom) {
    this.removeOverflowFactRows()
    overflowed = true
  }
  return overflowed
}

Secret.appendInitialPaddingRows = function() {
  while (true) {
    const overflowed = this.appendFactRow(Data.repRandomProperty())
    if (overflowed) {
      break
    }
  }
}

Secret.update = function () {
  const timestamp = new Date().getTime()
  if (this.shouldUpdate(timestamp)) {
    this.appendFactRow(Data.repRandomProperty())
    this.lastUpdateAt = timestamp
  }
}

$(() => {
  Secret.init()
  window.setInterval(() => { Secret.update() }, 1000)
})
