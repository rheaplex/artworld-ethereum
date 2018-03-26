import * as d3 from 'd3'

import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

//import * from './../../../../shared/js/shared.js'

import * as style from './../stylesheets/app.css'

//const CONTRACT_ADDRESS = '7226861714811c02f403d1851fa6ddd53fa9802e'
//const SENDER_ADDRESS = 'c30c2a33d0883dcc4c7154ebb6f85a629888f67d'
const BLOCK_HASH = '20de5314c69fe10e9eeabf7c36f5a53113dd0f055ca7f9e4eb21de046465137f'
const TRANSACTION_HASH = 'd11cd40d5f1c499b2d674d2523698e304a415384693ca944aa6369f2e4d277a7'

// Addresses are 20 bytes = 160 bits
// Hashes are 32 bytes = 256 bits
// Common factor for bits is 32
// 160 / 32 = 5
// 256 / 32 = 8

const address_cells_rows = 10
const address_cells_columns = 16
const HASH_CELLS_ROWS = 8
const HASH_CELLS_COLUMNS = 32

var bitValues = function(hash) {
  var values = Array();
  for (var i = 0; i < hash.length; i += 2) {
    var element = parseInt(hash.substring(i, i + 2), 16);
    values.push(element & 128 ? 1 : 0);
    values.push(element & 64 ? 1 : 0);
    values.push(element & 32 ? 1 : 0);
    values.push(element & 16 ? 1 : 0);
    values.push(element & 8 ? 1 : 0);
    values.push(element & 2 ? 1 : 0);
    values.push(element & 4 ? 1 : 0);
    values.push(element & 1 ? 1 : 0);
  }
  return values;
};

const drawing_svg = d3.select("#representation").append("svg")
      .attr("width", 960)
      .attr("height", 240);

const drawing_width = drawing_svg.attr('width')
const drawing_height = drawing_svg.attr('height')
/*
const address_cell_width = drawing_width / address_cells_columns
const address_cell_height = drawing_height / address_cells_rows

const address_bits = bitValues(CONTRACT_ADDRESS)
console.log(address_bits)

let index = 0
for (let v = 0; v < address_cells_rows; v++) {
  for (let h = 0; h < address_cells_columns; h++) {
    if (address_bits[index] == 1) {
      const x1 = h * address_cell_width
      const x2 = x1 + address_cell_width
      const y1 = v * address_cell_height
      const y2 = y1 + address_cell_height
      drawing_svg.append("line")
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr('stroke', 'lightgray')
        .attr('stroke-width', 1.0)
    }
    index += 1
  }
}
*/
const hash_cell_width = drawing_width / HASH_CELLS_COLUMNS
const hash_cell_height = drawing_height / HASH_CELLS_ROWS

const renderBlockHash = hash => {
  const hash_bits = bitValues(hash)
  let index = 0
  for (let v = 0; v < HASH_CELLS_ROWS; v++) {
    for (let h = 0; h < HASH_CELLS_COLUMNS; h++) {
      if (hash_bits[index] == 1) {
        const x1 = h * hash_cell_width
        const x2 = x1 + hash_cell_width
        const y1 = v * hash_cell_height
        const y2 = y1 + hash_cell_height
        drawing_svg.append("line")
          .attr("x1", x1)
          .attr("y1", y2)
          .attr("x2", x2)
          .attr("y2", y1)
          .attr('stroke', 'black')
          .attr('stroke-width', 1.0)
      }
      index += 1
    }
  }
}

const renderTransactionHash = hash => {
  const hash_bits = bitValues(hash)
  let index = 0
  for (let v = 0; v < HASH_CELLS_ROWS; v++) {
    for (let h = 0; h < HASH_CELLS_COLUMNS; h++) {
      if (hash_bits[index] == 1) {
        const x1 = h * hash_cell_width
        const x2 = x1 + hash_cell_width
        const y1 = v * hash_cell_height
        const y2 = y1 + hash_cell_height
        drawing_svg.append("line")
          .attr("x1", x1)
          .attr("y1", y1)
          .attr("x2", x2)
          .attr("y2", y2)
          .attr('stroke', 'black')
          .attr('stroke-width', 1.0)
      }
      index += 1
    }
  }
}

/*hash_bits = bitValues(CONTRACT_ADDRESS)
index = 0
for (let v = 0; v < hash_cells_rows; v++) {
  for (let h = 0; h < hash_cells_columns; h++) {
    if (hash_bits[index] == 1) {
      const x1 = h * hash_cell_width
      const x2 = x1 + hash_cell_width
      const y = (v * hash_cell_height) + (hash_cell_height / 2.0)
      drawing_svg.append("line")
        .attr("x1", x1)
        .attr("y1", y)
        .attr("x2", x2)
        .attr("y2", y)
        .attr('stroke', 'black')
        .attr('stroke-width', 1.0)
    }
    index += 1
  }
}*/

/*hash_bits = bitValues(SENDER_ADDRESS)
index = 0
for (let v = 0; v < hash_cells_rows; v++) {
  for (let h = 0; h < hash_cells_columns; h++) {
    if (hash_bits[index] == 1) {
      const x = (h * hash_cell_width) + (hash_cell_width / 2.0)
      const y1 = v * hash_cell_height
      const y2 = y1 + hash_cell_height
      drawing_svg.append("line")
        .attr("x1", x)
        .attr("y1", y1)
        .attr("x2", x)
        .attr("y2", y2)
        .attr('stroke', 'black')
        .attr('stroke-width', 1.0)
    }
    index += 1
  }
}*/


renderBlockHash(BLOCK_HASH)
renderTransactionHash(TRANSACTION_HASH)
