/*  SchellingFlags - Flags as focal points for aesthetics and ideology.
    Copyright (C) 2018  Rob Myers <rob@robmyers.org>

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

///////////////////////////////////////////////////////////////////////////////
// Colors
///////////////////////////////////////////////////////////////////////////////

// The number of colour choices
const NUM_COLOR_VALS = 7

// The colour names in the UI to the CSS colour names
const COLORS = {
  "Black": "Black",
  "White": "White",
  "Light Gray": "LightGray",
  "Dark Gray": "Gray",
  "Light Pink": "LightPink",
  "Dark Pink": "DeepPink",
  "Light Brown": "SandyBrown",
  "Dark Brown": "Brown",
  "Light Orange": "Orange",
  "Dark Orange": "OrangeRed",
  "Light Purple": "Plum",
  "Dark Purple": "Purple",
  "Light Red": "Red",
  "Dark Red": "DarkRed",
  "Light Green": "LightGreen",
  "Dark Green": "Green",
  "Light Blue": "SkyBlue",
  "Dark Blue": "Blue",
  "Light Cyan": "Cyan",
  "Dark Cyan": "DarkCyan",
  "Light Magenta": "Orchid",
  "Dark Magenta": "Magenta",
  "Light Yellow": "Yellow",
  "Dark Yellow": "Gold"
};

// Assumes order given above :-/
const COLORS_NAMES = Object.keys(COLORS)

const colorIndexToName = index => COLORS_NAMES[index]

const colorIndexToColor = index => COLORS[colorIndexToName(index)]

const colorIndexesToNames = indexes => indexes.map(colorIndexToName)

const colorIndexesToColors = indexes => indexes.map(colorIndexToColor)

///////////////////////////////////////////////////////////////////////////////
// Shape drawing utilities
///////////////////////////////////////////////////////////////////////////////

const diamondPathOffset = (width, height, remove) => {
  const offset = height * remove
  const top = offset
  const left = offset
  const bottom = height - offset
  const right = width - offset
  const xMiddle = width * 0.5
  const yMiddle = height * 0.5
  return `M ${left} ${yMiddle} L ${xMiddle} ${bottom} L ${right} ${yMiddle} L ${xMiddle} ${top} Z`
}

const drawCircle = (flagSVG, color, x, y, r) => {
  var circle = $(document.createElementNS('http://www.w3.org/2000/svg',
                                        'circle'))
      .attr({
        cx: x,
        cy: y,
        r: r,
        fill: color
      })
  flagSVG.append(circle)
}

const drawRect = (flagSVG, color, x, y, width, height) => {
  var rect = $(document.createElementNS('http://www.w3.org/2000/svg',
                                        'rect'))
      .attr({
        x: x,
        y: y,
        width: width,
        height: height,
        fill: color
      })
  flagSVG.append(rect)
}

const drawPath = (flagSVG, color, pathD) => {
  var path = $(document.createElementNS('http://www.w3.org/2000/svg',
                                        'path'))
      .attr({
        'd': pathD,
        fill: color
      })
  flagSVG.append(path)
}

///////////////////////////////////////////////////////////////////////////////
// Flags
///////////////////////////////////////////////////////////////////////////////

const drawRows = (flagSVG, colors, numRows) => {
  const flagWidth = flagSVG.width()
  const flagHeight = flagSVG.height()
  for (let i = 0; i < numRows; i++) {
    drawRect(flagSVG, colors[i],
             0, i * (flagHeight / numRows),
             flagWidth, (flagHeight / numRows))
  }
}

const drawColumns = (flagSVG, colors, numColumns)  => {
  const flagWidth = flagSVG.width()
  const flagHeight = flagSVG.height()
  for (let i = 0; i < numColumns; i++) {
    drawRect(flagSVG, colors[i],
             i * (flagWidth / numColumns), 0,
             (flagWidth / numColumns), flagHeight)
  }
}

const drawPathOnGround = (flagSVG, colors, pathD)  => {
  const flagWidth = flagSVG.width()
  const flagHeight = flagSVG.height()
  var rect = $(document.createElementNS('http://www.w3.org/2000/svg',
                                        'rect'))
      .attr({
        x: 0,
        y: 0,
        width: flagWidth,
        height: flagHeight,
        fill: colors[0]
      })
  flagSVG.append(rect)
  drawPath(flagSVG, colors[1], pathD)
}

const drawDiagonalDown = (flagSVG, colors)  => {
  const flagWidth = flagSVG.width()
  const flagHeight = flagSVG.height()
  const d = `M 0 0 L ${flagWidth} ${flagHeight} L ${flagWidth} 0 Z`
  drawPathOnGround(flagSVG, colors, d)
}

const drawDiagonalUp = (flagSVG, colors)  => {
  const flagWidth = flagSVG.width()
  const flagHeight = flagSVG.height()
  const d = `M 0 ${flagHeight} L ${flagWidth} 0 L ${flagWidth} ${flagHeight} Z`
  drawPathOnGround(flagSVG, colors, d)
}

const drawFourTriangles = (flagSVG, colors) => {
  const flagWidth = flagSVG.width()
  const flagHeight = flagSVG.height()
  const flagWidthHalf = flagWidth * 0.5
  const flagHeightHalf = flagHeight * 0.5
  // Left
  let d = `M 0 0 L ${flagWidthHalf} ${flagHeightHalf} L 0 ${flagHeight} Z`
  drawPath(flagSVG, colors[0], d)
  // Top
  d = `M 0 0 L ${flagWidth} 0 L ${flagWidthHalf} ${flagHeightHalf} Z`
  drawPath(flagSVG, colors[1], d)
  // Right
  d = `M ${flagWidth} 0 L ${flagWidthHalf} ${flagHeightHalf} L ${flagWidth} ${flagHeight} Z`
  drawPath(flagSVG, colors[2], d)
  // Bottom
  d = `M 0 ${flagHeight} L ${flagWidthHalf} ${flagHeightHalf} L ${flagWidth} ${flagHeight} Z`
  drawPath(flagSVG, colors[3], d)  
}

const drawCircleOnGround = (flagSVG, colors)  => {
  const flagWidth = flagSVG.width()
  const flagHeight = flagSVG.height()
  drawRect(flagSVG, colors[0], 0, 0, flagWidth, flagHeight)
  drawCircle(flagSVG, colors[1],
             (flagWidth * 0.5), (flagHeight * 0.5),
             (flagHeight * 0.4))
}

const drawRectangleOnGround = (flagSVG, colors)  => {
  const flagWidth = flagSVG.width()
  const flagHeight = flagSVG.height()
  const offset = flagHeight / 8.0
  const inset = offset * 2.0
  drawRect(flagSVG, colors[0], 0, 0, flagWidth, flagHeight)
  drawRect(flagSVG, colors[1],
           offset, offset,
           flagWidth - inset, flagHeight - inset)
}

const drawDiamondOnGround = (flagSVG, colors)  => {
  const d = diamondPathOffset(flagSVG.width(), flagSVG.height(), 0.1)
  drawPathOnGround(flagSVG, colors, d)
}

const drawDiagonalUpOnGround = (flagSVG, colors) => {
  drawRect(flagSVG, colors[0], 0, 0, flagSVG.width(), flagSVG.height())
  var path = $(document.createElementNS('http://www.w3.org/2000/svg',
                                        'path'))
      .attr({
        'd': `M 0 ${flagSVG.height()} L ${flagSVG.width()} 0`,
        'fill': 'none',
        'stroke': colors[1],
        'stroke-width': flagSVG.width() / 3.0
      })
  flagSVG.append(path)
}

const drawDiagonalDownOnGround = (flagSVG, colors) => {
  drawRect(flagSVG, colors[0], 0, 0, flagSVG.width(), flagSVG.height())
  var path = $(document.createElementNS('http://www.w3.org/2000/svg',
                                        'path'))
      .attr({
        'd': `M 0 0 L ${flagSVG.width()} ${flagSVG.height()}`,
        'fill': 'none',
        'stroke': colors[1],
        'stroke-width': flagSVG.width() / 3.0
      })
  flagSVG.append(path)
}

const LAYOUTS = {
  'Single Color' : {
    'id': 0,
    'colors': 1,
    'draw': (svg, colors) => drawRows(svg, colors, 1) 
  },
  'Two Rows': {
    'id': 1,
    'colors': 2,
    'draw': (svg, colors)  => drawRows(svg, colors, 2)
  },
  'Three Rows': {
    'id': 2,
    'colors': 3,
    'draw': (svg, colors)  => drawRows(svg, colors, 3)
  },
  'Four Rows': {
    'id': 3,
    'colors': 4,
    'draw': (svg, colors)  => drawRows(svg, colors, 4)
  },
  'Five Rows': {
    'id': 4,
    'colors': 5,
    'draw': (svg, colors)  => drawRows(svg, colors, 5)
  },
  'Six Rows': {
    'id': 5,
    'colors': 6,
    'draw': (svg, colors)  => drawRows(svg, colors, 6)
  },
  'Two Columns': {
    'id': 6,
    'colors': 2,
    'draw': (svg, colors)  => drawColumns(svg, colors, 2)
  },
  'Three Columns': {
    'id': 7,
    'colors': 3,
    'draw': (svg, colors)  => drawColumns(svg, colors, 3)
  },
  'Four Columns': {
    'id': 8,
    'colors': 4,
    'draw': (svg, colors)  => drawColumns(svg, colors, 4)
  },
  'Five Columns': {
    'id': 9,
    'colors': 5,
    'draw': (svg, colors)  => drawColumns(svg, colors, 5)
  },
  'Six Columns': {
    'id': 10,
    'colors': 6,
    'draw': (svg, colors)  => drawColumns(svg, colors, 6)
  },
  'Two Triangles (Up)' : {
    'id': 11,
    'colors': 2,
    'draw': drawDiagonalUp
  },
  'Two Triangles (Down)' : {
    'id': 12,
    'colors': 2,
    'draw': drawDiagonalDown
  },
  'Four Triangles' : {
    'id': 13,
    'colors': 4,
    'draw': drawFourTriangles
  },
  'Diamond' : {
    'id': 14,
    'colors': 2,
    'draw': drawDiamondOnGround
  },
  'Diagonal (Up)' : {
    'id': 15,
    'colors': 2,
    'draw': drawDiagonalUpOnGround
  },
  'Diagonal (Down)' : {
    'id': 16,
    'colors': 2,
    'draw': drawDiagonalDownOnGround
  },
  'Rectangle' : {
    'id': 17,
    'colors': 2,
    'draw': drawRectangleOnGround
  },
  'Circle' : {
    'id': 18,
    'colors': 2,
    'draw': drawCircleOnGround
  },
}

const LAYOUTS_NAMES = Object.keys(LAYOUTS)

const LAYOUTS_INDEXES = [];
LAYOUTS_NAMES.forEach(name => LAYOUTS_INDEXES[LAYOUTS[name].id] = name)

///////////////////////////////////////////////////////////////////////////////
// Overlays
///////////////////////////////////////////////////////////////////////////////

const drawCircleOverlay = (flagSVG, color) => {
  const flagWidth = flagSVG.width()
  const flagHeight = flagSVG.height()
  drawCircle(flagSVG, color,
             flagWidth * 0.5, flagHeight * 0.5,
             flagHeight * 0.25)  
}

const drawDiamondOverlay = (flagSVG, color) => {
  const d = diamondPathOffset(flagSVG.width(), flagSVG.height(), 0.33)
  drawPath(flagSVG, color, d)
}

const drawTriangleOverlayLeft = (flagSVG, color) => {
  drawPath(flagSVG, color, `M 0 0 L ${flagSVG.width() * 0.33} ${flagSVG.height() * 0.5} L 0 ${flagSVG.height()} Z`)
}

const drawTriangleOverlayTop = (flagSVG, color) => {
  drawPath(flagSVG, color, `M 0 0 L ${flagSVG.width() * 0.5} ${flagSVG.height() * 0.33} L ${flagSVG.width()} 0 Z`)
}

const drawTriangleOverlayRight = (flagSVG, color) => {
  drawPath(flagSVG, color, `M ${flagSVG.width()} 0 L ${flagSVG.width() * 0.66} ${flagSVG.height() * 0.5} L ${flagSVG.width()} ${flagSVG.height()} Z`)
}

const drawTriangleOverlayBottom = (flagSVG, color) => {
  drawPath(flagSVG, color, `M 0 ${flagSVG.height()} L ${flagSVG.width() * 0.5} ${flagSVG.height() * 0.66} L ${flagSVG.width()} ${flagSVG.height()} Z`)
}

const drawRectangleOverlayTopLeft = (flagSVG, color) => {
  drawRect(flagSVG, color,
           0, 0,
           (flagSVG.width() * 0.4), flagSVG.height() * 0.5)
}

const drawRectangleOverlayBottomLeft = (flagSVG, color) => {
  drawRect(flagSVG, color,
           0, flagSVG.height() * 0.5,
           (flagSVG.width() * 0.4), flagSVG.height() * 0.5)
}

const drawRectangleOverlayTopRight = (flagSVG, color) => {
  drawRect(flagSVG, color,
           flagSVG.width() * 0.6, 0,
           (flagSVG.width() * 0.4), flagSVG.height() * 0.5)
}

const drawRectangleOverlayBottomRight = (flagSVG, color) => {
  drawRect(flagSVG, color,
           flagSVG.width() * 0.6, flagSVG.height() * 0.5,
           (flagSVG.width() * 0.4), flagSVG.height() * 0.5)
}

const drawRectangleOverlayCenter = (flagSVG, color) => {
  drawRect(flagSVG, color,
           flagSVG.width() * 0.33, flagSVG.height() * 0.33,
           (flagSVG.width() * 0.33), flagSVG.height() * 0.33)
}

const drawStripeOverlayVertical = (flagSVG, color) => {
  const width = flagSVG.width() / 12.0
  const center = flagSVG.width() * 0.5
  drawRect(flagSVG, color,
           (center - (width * 0.5)), 0,
           width, flagSVG.height()) 
}

const drawStripeOverlayHorizontal = (flagSVG, color) => {
  const height = flagSVG.height() / 12.0
  const center = flagSVG.height() * 0.5
  drawRect(flagSVG, color,
           0, (center - (height * 0.5)),
           flagSVG.width(), height) 
}

const drawStripeOverlayDiagonalDown = (flagSVG, color) => {
  var path = $(document.createElementNS('http://www.w3.org/2000/svg',
                                        'path'))
      .attr({
        'd': `M 0, 0 L ${flagSVG.width()} ${flagSVG.height()}`,
        'fill': 'none',
        'stroke': color,
        'stroke-width': flagSVG.width() / 12.0
      })
  flagSVG.append(path)
}

const drawStripeOverlayDiagonalUp = (flagSVG, color) => {
  var path = $(document.createElementNS('http://www.w3.org/2000/svg',
                                        'path'))
      .attr({
        'd': `M 0, ${flagSVG.height()} L ${flagSVG.width()} 0`,
        'fill': 'none',
        'stroke': color,
        'stroke-width': flagSVG.width() / 12.0
      })
  flagSVG.append(path)
}

// No diagonal stripe overlays to avoid "anti-" flags...

const OVERLAYS = {
  'None': {
    'id': 0,
    'draw': () => {}
  },
  'Circle': {
    'id': 1,
    'draw': drawCircleOverlay
  },
  'Diamond': {
    'id': 2,
    'draw': drawDiamondOverlay
  },
  'Triangle (Left)': {
    'id': 3,
    'draw': drawTriangleOverlayLeft
  },
  'Triangle (Top)': {
    'id': 4,
    'draw': drawTriangleOverlayTop
  },
  'Triangle (Right)': {
    'id': 5,
    'draw': drawTriangleOverlayRight
  },
  'Triangle (Bottom)': {
    'id': 6,
    'draw': drawTriangleOverlayBottom
  },
  'Rectangle (Top Left)': {
    'id': 7,
    'draw': drawRectangleOverlayTopLeft
  },
  'Rectangle (Bottom Left)': {
    'id': 8,
    'draw': drawRectangleOverlayBottomLeft
  },
  'Rectangle (Top Right)': {
    'id': 9,
    'draw': drawRectangleOverlayTopRight
  },
  'Rectangle (Bottom Right)': {
    'id': 10,
    'draw': drawRectangleOverlayBottomRight
  },
  'Rectangle (Center)': {
    'id': 11,
    'draw': drawRectangleOverlayCenter
  },
  // Stripes might be used to make 'anti-" flags, so disallow
  /*
  'Stripe (Vertical)': {
    'id': 12,
    'draw': drawStripeOverlayVertical
  },
  'Stripe (Horizontal)': {
    'id': 13,
    'draw': drawStripeOverlayHorizontal
  },
  'Stripe (Diagonal Up)': {
    'id': 14,
    'draw': drawStripeOverlayDiagonalUp
  },
  'Stripe (Diagonal Down)': {
    'id': 15,
    'draw': drawStripeOverlayDiagonalDown
  },
*/
}

const OVERLAYS_NAMES = Object.keys(OVERLAYS)

const OVERLAYS_INDEXES = [];
OVERLAYS_NAMES.forEach(name => OVERLAYS_INDEXES[OVERLAYS[name].id] = name)

///////////////////////////////////////////////////////////////////////////////
// Main rendering code for flags
///////////////////////////////////////////////////////////////////////////////

let numRows = 3
let numCols = 4
let displayFlagsClass = 'flag12'
let colClass = 'col-md-3'

const createFlagSVG = (rootId, index) => {
  const root = $(rootId)
  const flagSVG = $(`<svg class="flag" id="flag-${index}"/>`)
        .addClass(displayFlagsClass)
        .addClass('display-flag')
  root.append(flagSVG)
  return flagSVG
}

const createFlagSVGs = (rootElement, numRows, numCols) => {
  $(rootElement).empty()
  for (let i = 0; i < numRows; i++) {
    const row = $('<div class="row"></div>').appendTo(rootElement)
    for (let j = 0 ; j < numCols; j++) {
      const col = $(`<div class="column ${colClass}"></div>`).appendTo(row)
      createFlagSVG(col, (i * numCols) + j)
    }
  }
}

const drawFlag = (element, layoutName, overlayName, colorNames) => {
  const colorValues = colorNames.map(name => COLORS[name])
  LAYOUTS[layoutName].draw(element, colorValues)
  const layoutColorCount = LAYOUTS[layoutName].colors
  OVERLAYS[overlayName].draw(element, colorValues[layoutColorCount])
}

const drawFlagByIndexes = (element, layout, overlay, colors) => {
  const colorNames = colorIndexesToNames(colors)
  const layoutName = LAYOUTS_INDEXES[layout]
  const overlayName = OVERLAYS_INDEXES[overlay]
  drawFlag(element, layoutName, overlayName, colorNames)
}

///////////////////////////////////////////////////////////////////////////////
// UI
///////////////////////////////////////////////////////////////////////////////

const hideUI = () => {
  $('.gui').hide()
}

const showUI = () => {
  $('.gui').show()
}

const clearUI = () => {
  // Clear the previous layout, if any. Useful for background clicks (no flag).
  setLayoutSelectVal(0)
  setOverlaySelectVal(0)
  setUIColorVals(Array(NUM_COLOR_VALS).fill(0))
}

// Draw the flag

const updateFlagUI = () => {
  const layout = getUILayoutVal()
  const overlay = getUIOverlayVal()
  const colors = getUIColorVals()
  drawFlagByIndexes($('#ui-flag'), layout, overlay, colors)
  updateFlagUIHash()
  enableUIColorsForSelectedOptions()
}

// Colors

const createColorSelectOptions = select => {
  for (let i = 0; i < COLORS_NAMES.length; i++) {
    const color_name = COLORS_NAMES[i];
    $(select).append($(`<option value="${i}">${color_name}</option>`))
  }
}

const colorSelectChanged = e => {
  e.stopPropagation()
  const select = e.target
  const index = $(select).val()
  $(select).next().css('background-color', COLORS[COLORS_NAMES[index]])
  updateFlagUI()
}

const initColorSelects = () => {
  $('.flag-color').each((i, element) => createColorSelectOptions(element))
  $('.flag-color').change(colorSelectChanged)
}

const setUIColorVals = (colorIndexes) => {
  $('.flag-color').each((i, element) => {
    $(element).val(colorIndexes[i])
    $(element).next().css('background-color',
                          colorIndexToColor(colorIndexes[i]))
  })
}

const getColorSelectVal = select => $(select).val()

const getUIColorVals = () =>
      $('.flag-color').map((i, select) => getColorSelectVal(select)).get()

const enableUIColorsForSelectedOptions = () => {
  let count = LAYOUTS[LAYOUTS_NAMES[getUILayoutVal()]].colors
  if (getUIOverlayVal() != 0) {
    count += 1
  }
  $('.flag-color').prop('disabled', true)
  $('.flag-color').slice(0, count).prop('disabled', false)
}

// Layouts

const createLayoutSelectOptions = () => {
  for (let i = 0; i < LAYOUTS_NAMES.length; i++) {
    const name = LAYOUTS_NAMES[i];
    $('#flag-layout')
      .append($(`<option value="${LAYOUTS[name].id}">${name}</option>`))
  }
}

const layoutSelectChanged = e => {
  e.stopPropagation()
  enableUIColorsForSelectedOptions()
  updateFlagUI()
}

const initLayoutSelects = () => {
  $('#flag-layout').each((i, element) => createLayoutSelectOptions(element))
  $('#flag-layout').change(layoutSelectChanged)
}

const setLayoutSelectVal = (index) =>
      $('#flag-layout').val(index)

const getUILayoutVal = () => $('#flag-layout').val()

// Overlays

const createOverlaySelectOptions = () => {
  for (let i = 0; i < OVERLAYS_NAMES.length; i++) {
    const name = OVERLAYS_NAMES[i]
    $('#flag-overlay')
      .append($(`<option value="${OVERLAYS[name].id}">${name}</option>`))
  }
}

const overlaySelectChanged = e => {
  e.stopPropagation()
  enableUIColorsForSelectedOptions()
  updateFlagUI()
}

const initOverlaySelects = () => {
  $('#flag-overlay').each((i, element) => createOverlaySelectOptions(element))
  $('#flag-overlay').change(overlaySelectChanged)
}

const setOverlaySelectVal = (index) =>
      $('#flag-overlay').val(index)

const getUIOverlayVal = () => $('#flag-overlay').val()

///////////////////////////////////////////////////////////////////////////////
// Blockchain Interaction
// These are utter MVC fail
///////////////////////////////////////////////////////////////////////////////

let schellingFlags

const pledgeToFlag = async () => {
  const layout = getUILayoutVal()
  const overlay = getUIOverlayVal()
  const colors = getUIColorVals()
  await schellingFlags.pledgeToFlagByProperties(layout, overlay, colors)
}

const updateFlag = async (index, flagID) => {
  if (flagID !== 0) {
    const [colors_, layout_, overlay_, pledgeCount_] =
          await schellingFlags.getFlag.call(flagID)
    const colors = colors_.map(web3.toDecimal)
    const layout = web3.toDecimal(layout_)
    const overlay = web3.toDecimal(overlay_)
    const pledgeCount = web3.toDecimal(pledgeCount_)
    element = $(`#flag-${index}`)
    drawFlagByIndexes(element, layout, overlay, colors)
    element.click(event => {
      event.stopPropagation()
      setLayoutSelectVal(layout)
      setOverlaySelectVal(overlay)
      setUIColorVals(colors)
      showUI()
      updateFlagUI()
    })
  }
}

const updateFlags = async () => {
  const mostPopular = (await schellingFlags.getMostPopular.call())
        .map(web3.toDecimal)
  createFlagSVGs($('#flags'), numRows, numCols)
  for (let i = 0; i < mostPopular.length; i++) {
    // We could do this in parallel
    await updateFlag(i, mostPopular[i])
  }
}

const getFlagUIHash = async () => {
  const layout = getUILayoutVal()
  const overlay = getUIOverlayVal()
  const colors = getUIColorVals()
  return schellingFlags.hashFlagProperties.call(layout, overlay, colors)
}

const updateFlagUIHash = async () => {
  const hash = await getFlagUIHash()
  const id = await schellingFlags.flagIds.call(hash)
  $('#current-flag-id').text(id + ': ' + web3.toHex(hash).slice(0,18) + '...')
  const flag = await schellingFlags.flags.call(id)
  $('#current-flag-pledge-count').text(web3.toDecimal(flag[2]))
}

const initEventMostPopularChanged = async () => {
  const event = schellingFlags.MostPopularChanged();
  event.watch((err, result) => {
    if(err) {
        console.log(err);
        return;
    }
    // Just update everything rather than working out what changed
    updateFlags()
  })
}

///////////////////////////////////////////////////////////////////////////////
// Main Flow Of Execution
///////////////////////////////////////////////////////////////////////////////

$(() => {
  $('body').click(event => {
    console.log('body')
    event.stopPropagation()
    clearUI()
    showUI()
    updateFlagUI()
  })
  
  $('#do-pledge-button').click(event => {
    event.stopPropagation()
    hideUI()
    pledgeToFlag()
  })
  $('#cancel-pledge-button').click(event => {
    event.stopPropagation()
    hideUI()
  })
  
  initColorSelects()
  initLayoutSelects()
  initOverlaySelects()
  
  // Prevent clicks bubbling to body and calling its click handler
  $('.gui').click(event => event.stopPropagation())
  
  hideUI()

  // Make sure the drawing doesn't go horribly wrong if the window is resized
  // or zoomed.
  $(window).resize(updateFlags)
  
  if (typeof web3 !== 'undefined') {
    // Use injected provider from Mist or Metamask etc.
    window.web3 = new Web3(web3.currentProvider);
    
    $.getJSON('../build/contracts/SchellingFlags.json')
      .then(contract_data => {
        const SchellingFlags = TruffleContract(contract_data)
        SchellingFlags.setProvider(web3.currentProvider)
        SchellingFlags.deployed()
          .then(instance => {
            schellingFlags = instance
            updateFlags()
            initEventMostPopularChanged()
          })
      })
  } else {
    alert('Cannot connect to the Ethereum network.')
  }

})
