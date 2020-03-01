/*  DemocraticPalette - A palette that anyone can vote for the colours of.
    Copyright (C) 2016, 2020  Rhea Myers <rob@Rhea Myers.org>

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

let colour_picker;

let current_representation;

let gui_is_showing = false;

let DemocraticPalette;

////////////////////////////////////////////////////////////////////////////////
// UI configuration, state and interaction
////////////////////////////////////////////////////////////////////////////////

const selectTab = (tabClass, tabId) => {
  Array.prototype.forEach.call(
    document.getElementsByClassName(tabClass),
    item => item.classList.remove('is-active')
  );
  document.getElementById(tabId).classList.add('is-active');
};

const selectTabContent = (contentClass, contentId) => {
  Array.prototype.forEach.call(
    document.getElementsByClassName(contentClass),
    item => item.style.display= 'none'
  );
  document.getElementById(contentId).style.display = 'block';
};

const selectVoteTab = () => {
  selectTab('gui-tab', 'tab-vote');
  selectTabContent('tab-pane', 'tab-vote-content');
};

const selectRepresentationTab = () => {
  selectTab('gui-tab', 'tab-representation');
  selectTabContent('tab-pane', 'tab-representation-content');
};

const setStatus = message => {
  const status = document.getElementById('status');
  status.textContent = message;
  status.style.setProperty('display', 'block');
};

const makeColourPicker = () => {
  colour_picker = new ColourPicker(
    document.getElementById('change-colour-picker'),
    'images/colour-picker/'
  );
  colour_picker.addChangeListener(colour => {
    // This may be triggered by a promise, and this will call a promise,
    // so delay it until the next tick (which will be after the promise
    // returns), otherwise we get this error:
    // http://bluebirdjs.com/docs/warning-explanations.html#warning-a-promise-was-created-in-a-handler-but-was-not-returned-from-it
    setTimeout(() => {
      const rgb = colour.getIntegerRGB();
      applyColourVoteCountFromState(rgb.r, rgb.g, rgb.b);
    }, 0); // 0 == as soon as possible after the current tick
  });
};

const showVoteForColour = (event, colour_index) => {
  event.stopPropagation();
  if (! gui_is_showing) {
    if (colour_index == -1) {
      colour_picker.setColour(new RGBColour(255, 255, 255));
      showGui();
    } else {
      DemocraticPalette.methods.palette(colour_index).call()
        .then(colour => {
          colour_picker.setColour(new RGBColour(
            web3.utils.hexToNumber(colour[0]),
            web3.utils.hexToNumber(colour[1]),
            web3.utils.hexToNumber(colour[2])
          ));
          showGui();
        });
    }
  }
};

const showGui = () => {
  selectVoteTab();
  document.getElementById('gui').classList.add('is-active');
  gui_is_showing = true;
};

const hideGui = () => {
  document.getElementById('gui').classList.remove('is-active');
  gui_is_showing = false;
};

const showVotingMessage = () => {
  document.getElementById('voting-in-progress').classList.add('is-active');
};

const hideVotingMessage = () => {
  document.getElementById('voting-in-progress').classList.remove('is-active');
};

const representationElements = () => document.querySelectorAll(
  '#' + current_representation + ' td'
);

const setElementColour = (element, red, green, blue) => {
  element.style.backgroundColor = 'rgb('
    + red.toString() + ', '
    + green.toString() + ', '
    + blue.toString() + ')';
};

const applyColourRepresentationFromState = () => {
  Array.prototype.forEach.call(
    representationElements(),
    (element, index) => DemocraticPalette.methods.palette(index).call()
      .then (colour => setElementColour(
        element,
        colour[0],
        colour[1],
        colour[2]
      ))
  );
};

const setRepresentation = name => {
  current_representation = name;
  Array.prototype.forEach.call(
    document.getElementsByClassName('representation'),
    element => element.style.setProperty('display', 'none')
  );
  // FIXME: explicitly set a good value
  document.getElementById(current_representation).style.removeProperty(
    'display'
  );
  applyColourRepresentationFromState();
};

const applyColourVoteCountFromState = (r, g, b) => {
 document.getElementById('selected-colour-votes').textContent = '...';
  DemocraticPalette.methods.voteCount(r, g, b).call()
    .then(
      count => document.getElementById('selected-colour-votes').textContent
        = web3.utils.hexToNumber(count)
    );
};

////////////////////////////////////////////////////////////////////////////////
// Contract interaction
////////////////////////////////////////////////////////////////////////////////

const tryForAccountAccess = async () => {
  let account;
  if (window.ethereum) {
    try {
      // Request account access if needed
      account = (await ethereum.enable())[0];
    } catch (error) {
      account = false;
    }
  } else if (window.web3) {
    account = (await web3.eth.getAccounts())[0];
  } else {
    account = false;
  }
  return account;
};

const doVoteForColour = async () => {
  const colour = colour_picker.getColour().getRGB();
  hideGui();
  const selectedAccount = await tryForAccountAccess();
  if(!selectedAccount) {
    setStatus("Error voting for colour - no account selected.");
    return;
  }
  showVotingMessage();
  try {
    await DemocraticPalette.methods
      .voteFor(colour.r, colour.g, colour.b)
      .send({ from: selectedAccount })
      .catch(e => {
        console.log(e);
        setStatus("Error voting for colour - see log.");
      });
  } finally {
    hideVotingMessage();
  }
};

const installPaletteChangedCallback = () => {
  DemocraticPalette.events.PaletteChanged().on(
    'data',
    // Ignore the index, just set all the colours
    event => applyColourRepresentationFromState()
  );
};


////////////////////////////////////////////////////////////////////////////////
// Go!
////////////////////////////////////////////////////////////////////////////////

window.onload = async () => {
  // Connect to Ethereum or fail.
  if (window.ethereum) {
    // Modern web3
    window.web3 = new Web3(ethereum);
  } else if (window.web3) {
    // Old school web3
    window.web3 = new Web3(web3.currentProvider);
  } else {
    document.write(
      'No Ethereum access. Try an Ethereum plugin or Ethereum-enabled browser'
    );
    return;
  }

  // Make a Web3.js 1.0 contract instance of the contract.
  const contractNetworkResponse = await fetch(
    // Relative to index.html, not this file.
    "../build/contracts/DemocraticPalette.json"
  );
  const contractJSON = await contractNetworkResponse.json();
  const abi = contractJSON.abi;
  const network = await web3.eth.net.getId();
  const address = contractJSON.networks[network].address;
  DemocraticPalette = new web3.eth.Contract(abi, address);

  // Set up tab click handlers
  document.getElementById('tab-vote-trigger').addEventListener(
    'click',
    selectVoteTab
  );
  document.getElementById('tab-representation-trigger').addEventListener(
    'click',
    selectRepresentationTab
  );

  // Set up everything else.
  makeColourPicker();
  setRepresentation('stripes');
  installPaletteChangedCallback();
  applyColourRepresentationFromState();
};
