/*  Token Grid - A grid that can only be updated by burning a token.
    Copyright (C) 2017, 2019 Rhea Myers <rob@Rhea Myers.org>

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
// Globals are bad
////////////////////////////////////////////////////////////////////////////////

let tokenGrid


////////////////////////////////////////////////////////////////////////////////
// Ethereum setup
////////////////////////////////////////////////////////////////////////////////

const initializeWeb3 = () => {
  let initialized
  if (window.ethereum) {
    // Modern web3
    window.web3 = new Web3(ethereum)
    initialized = true
  } else if (window.web3) {
    // Old school web3
    window.web3 = new Web3(web3.currentProvider)
    initialized = true
  } else {
    // No web3 access
    initialized = false
  }
  return initialized
}

const tryForAccountAccess = async () => {
  let account
  if (window.ethereum) {
    try {
      // Request account access if needed
      account = (await ethereum.enable())[0]
      accountsAccessable = true
    } catch (error) {
      account = false
    }
  } else if (window.web3) {
    account = (await web3.eth.getAccounts())[0]
  } else {
    account = false
  }
  return account
}


////////////////////////////////////////////////////////////////////////////////
// Grid Specification wrangling
////////////////////////////////////////////////////////////////////////////////

const widthsToHex = (id, callback) => {
  return '0x'
    + $(id).val()
    .split(',')
    .map(x => parseInt(x, 10).toString(16).padStart(2, '0'))
    .join('')
}

// This is different from the validation we use in the GUI, which is bad,
// so make sure there are no surprises.

// Also notice we sort.

const stringToPositions = function (string) {
  return string.split(',')
    .map(function (x) { return parseInt(x, 10) })
    .filter( function (x) { return ((! isNaN(x))) && (x >= 1) && (x <= 255) })
    .sort(function (a, b) { return a - b })
}

const positionsToString = function (array) {
  return array.join(',')
}


////////////////////////////////////////////////////////////////////////////////
// Grid display
////////////////////////////////////////////////////////////////////////////////

const drawGrid = function (canvasId, height, width, lineWidth, heights, widths) {
  const canvas = $(canvasId).get(0)
  const ctx = canvas.getContext("2d")
  canvas.width  = width
  canvas.height = height
  ctx.strokeStyle = 'black'
  ctx.lineWidth = lineWidth
  const xscale = width / 255
  const yscale = height / 255
  const offset = ctx.lineWidth / 2
  widths.forEach(function (x) {
    const h = (x * xscale) - offset
    ctx.beginPath()
    ctx.moveTo(h, 0)
    ctx.lineTo(h, height)
    ctx.stroke()
  })
  heights.forEach(function (y) {
    const v = height - ((y * yscale) - offset)
    ctx.beginPath()
    ctx.moveTo(0, v)
    ctx.lineTo(width, v)
    ctx.stroke()
  })
}

const drawGridRepresentation = (rows, columns) => {
  drawGrid("#grid", 1600, 1600, 1600/255, rows, columns)
}


////////////////////////////////////////////////////////////////////////////////
// GUI, some network reads
////////////////////////////////////////////////////////////////////////////////

const hideUI = event => {
  event.stopPropagation()
  $('.gui').hide()
}

const updateGuiFromBlockchain = async () => {
  const account = await tryForAccountAccess()
  if(! account) {
    $('.account').text('unknown')
    $('.num-tokens').text('?')
    $('.btn-primary').prop('disabled', true);
  } else {
    const balance = (await tokenGrid.balanceOf(account)).toNumber()
    $('.account').text(account)
    $('.num-tokens').text(balance)
    // Enable or disable the update and request OK buttons to avoid the user
    // trying to do something that will fail and cost them gas.
    if(balance == 0) {
      $('#grid-gui-update').prop('disabled', true);
    } else {
      $('#grid-gui-update').prop('disabled', false);
    }
    if(balance > 9) {
      $('#grid-gui-request').prop('disabled', true);
    } else {
      $('#grid-gui-request').prop('disabled', false);
    }
  }
}

const updateGridFromBlockchain = async () => {
  const rows = (await tokenGrid.rows()).toArray(1)
  const columns = (await tokenGrid.columns()).toArray(1)
  // Don't pull the rug out from under the user if they are editing
  //$('#grid-gui-rows').val(positionsToString(rows))
  //$('#grid-gui-columns').val(positionsToString(columns))
  //drawGridGui()
  await drawGridRepresentation(rows, columns)
}

const showUI = async event => {
  event.stopPropagation()
  await updateGuiFromBlockchain()
  const rows = (await tokenGrid.rows()).toArray(1)
  const columns = (await tokenGrid.columns()).toArray(1)
  $('#grid-gui-rows').val(positionsToString(rows))
  $('#grid-gui-columns').val(positionsToString(columns))
  drawGridGui()
  $('.gui').show()
}

const getGuiRows = function () {
  return stringToPositions($('#grid-gui-rows').val())
}

const getGuiColumns = function () {
  return stringToPositions($('#grid-gui-columns').val())
}

// Today I will be thinking mostly in regexes

const guiWidthsFilter = function (widths, event) {
  // Collapse multiple commas to single commas
  widths.val(widths.val().replace(/,+/g, ','))
  // 44 == ASCII comma
  if (event.which != 44) {
    // Strip out everything except numbers and commas
    widths.val(widths.val().replace(/[^\d,]/g, ''))
    // No numbers longer than three digits
    widths.val(widths.val().replace(/(\d{1,3})[^,]*(,|$)/g, '$1$2'))
    // The lowest number is one
    widths.val(widths.val().replace(/(^|,)0(,|$)/g, '$11$2'))
    // The highest value is 255
    widths.val(widths.val().replace(/\d{3}(,|$)/g,
                                    n => parseInt(n) > 255 ? '255' : n))
  }
  // More than 32 items? Truncate to 32
  if (((widths.val().match(/,/g) || []).length) > 31) {
    widths.val(widths.val().split(',').slice(0, 32).join(','))
  }
}

const guiRowsChanged = function (event) {
  const rows = $('#grid-gui-rows')
  guiWidthsFilter(rows, event)
  drawGridGui()
}

const guiColumnsChanged = function (event) {
  const columns = $('#grid-gui-columns')
  guiWidthsFilter(columns, event)
  drawGridGui()
}

const drawGridGui = function () {
  drawGrid("#gui-grid-preview", 255, 255, 1.2, getGuiRows(), getGuiColumns())
}

////////////////////////////////////////////////////////////////////////////////
// User actions, including those that touch the network
////////////////////////////////////////////////////////////////////////////////

const userSelectedUpdate = async event => {
  hideUI(event)
  const account = await tryForAccountAccess()
  if (!account) {
    alert('Cannot update grid on blockchain without Ethereum account access.')
  } else {
    const setRowsTo = widthsToHex('#grid-gui-rows')
    const setColumnsTo = widthsToHex('#grid-gui-columns')
    //  showUpdating()
    await tokenGrid.setGrid(setRowsTo, setColumnsTo, {from: account})
  }
}

const userSelectedRequest = async event => {
  hideUI(event)
  const account = await tryForAccountAccess()
  if (!account) {
    alert('Cannot purchase token without Ethereum account access.')
  } else {
    await tokenGrid.requestToken({from: account})
  }
}

const userSelectedCancel = event => {
  hideUI(event)
}


////////////////////////////////////////////////////////////////////////
// Lifecycle
////////////////////////////////////////////////////////////////////////

const listenToEvents = () => {
  // truffle-contract style EventListener-s.
  tokenGrid
    .Transfer()
    .on('data', updateGuiFromBlockchain)
  tokenGrid
    .Grid()
    .on('data', updateGridFromBlockchain)
}

const initUI = async () => {
  $('#grid').click(showUI)
  $('#grid-gui-rows').keydown(guiRowsChanged)
  $('#grid-gui-rows').on('input', guiRowsChanged)
  $('#grid-gui-columns').keydown(guiColumnsChanged)
  $('#grid-gui-columns').on('input', guiColumnsChanged)
  $('#grid-gui-update').click(userSelectedUpdate)
  $('#grid-gui-request').click(userSelectedRequest)
  $('.grid-gui-cancel').click(hideUI)
  listenToEvents()
  const rows = (await tokenGrid.rows()).toArray(1)
  const columns = (await tokenGrid.columns()).toArray(1)
  drawGridRepresentation(rows, columns)
}

const initGrid = async callback => {
  if (initializeWeb3()) {
    const contract_data = await $.getJSON('../build/contracts/TokenGrid.json')
    const TokenGrid = TruffleContract(contract_data)
    TokenGrid.setProvider(web3.currentProvider)
    tokenGrid = await TokenGrid.deployed()
    await callback(tokenGrid)
  } else {
    alert('Cannot connect to the Ethereum network.')
  }
}

$(window).on('load', async () => initGrid(initUI))
