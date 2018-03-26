# upload.py - Upload a webcam image's palette to the Ethereum blockchain
# Copyright (C) 2011,2018  Rob Myers rob@robmyers.org
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

import json
import web3

from PIL import Image
import sane

from web3 import Web3, HTTPProvider
from web3.contract import ConciseContract

import config

################################################################################
# Webcam
################################################################################

NUM_COLOURS_AND_CHANNELS = 8

def get_image():
    """Grab a single frame from the first webcam attached to the system"""
    webcam = sane.open('v4l:/dev/video0')
    webcam.mode='color'
    webcam.start()
    img = webcam.snap()
    webcam.close()
    return img

################################################################################
# Colour extraction
################################################################################

def get_image_colours(img, colour_count=NUM_COLOURS_AND_CHANNELS):
    """Get a palette of the given size from the image"""
    # Posterize the image to the specified number of colours
    quantized_img = img.convert('P', palette=Image.ADAPTIVE,
                                colors=colour_count)
    # convert the posterized image back to rgb
    rgb_img = quantized_img.convert('RGB')
    # so we can get the colours as [(count, (r, g, b)), ...] rather than indexes
    return rgb_img.getcolors()

def colour_luminance(colour):
    """Get the brightness of the colour"""
    return (0.2126 * colour[0]) + (0.7152 * colour[1]) + (0.0722 * colour[2])

def sort_colours(colours):
    """Sort the colours by luminance, extracted from count/colour tuples"""
    colours = [colour[1] for colour in colours]
    sorted_colours = sorted(colours, key=colour_luminance)
    return sorted_colours

def colour_triples_to_component_lists(colours):
    """Convert a list of [(r,g,b),(r,g,b),...]
       to ([r,r,...], [g,g,...], [b,b,...])"""
    return zip(*colours)

def get_colours_from_webcam():
    """Open the webcam, get the colours, sort and return the vectors"""
    img = get_image()
    colours_counts = get_image_colours(img)
    sorted_colours = sort_colours(colours_counts)
    return colour_triples_to_component_lists(sorted_colours)

################################################################################
# Connect to Web3
################################################################################

def connect_to_web3():
    """Return a Web3 connection to our Ethereum endpoint"""
    return Web3(HTTPProvider(config.JSONRPC_ENDPOINT))

def get_contract(w3):
    """Return the contract instance"""
    return w3.eth.contract(address=config.CONTRACT_ADDRESS,
                           abi=confi.CONTRACT_ABI,
                           ContractFactoryClass=ConciseContract)

def send_colours_transaction(contract, red, green, blue):
    """Send the colours to the contract and return the transaction hash"""
    return contract_instance.transact(). \
        setColours(red, green, blue, {'from': config.ACCOUNT_ADDRESS})

def send_colours_to_blockchain(red, green, blue):
    """Connect to the Ethereum blockchain and upload the colours"""
    w3 = connect_to_web3()
    contract = get_contract(w3)
    w3.personal.unlockAccount(config.ACCOUNT_ADDRESS,
                              config.ACCOUNT_PASSWORD,
                              60)
    tx_hash = send_colours_transation(contract, red, green, blue)
    personal.lockAccount(config.ACCOUNT_ADDRESS)
    return tx_hash

################################################################################
# Main flow of execution
################################################################################

if __name__ == '__main__':
    sane.init()
    (red, green, blue) = get_colours_from_webcam()
    tx_hash = send_colours_to_blockchain(red, green, blue)
    print("Tx: " + tx_hash)
