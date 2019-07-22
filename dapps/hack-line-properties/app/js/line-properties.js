/*  Hack Line Properties - Line stroke properties.
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

const LINE_CAPS = ['butt', 'round', 'square'];

const lineCap = index => LINE_CAPS[index % LINE_CAPS.length];

const setLinePropertiesCss = (id, width, linecap, dasharray) => {
  const applicant = document.getElementById(id);
  applicant.setAttribute('style', `fill: none; stroke: black; stroke-width: ${width}pt; stroke-linecap: ${lineCap(linecap)}; stroke-dasharray: ${dasharray}`);
};

const hexToDashes = hex => hex.match(/[0-9A-F]{2}/g).map(a => parseInt(a, 16));


class PropertiesDisplay {
  constructor (properties) {
    properties.registerLinePropertiesChangedHandler(
      this.drawPropertiesRepresentationEvent.bind(this)
    );
  }

  drawPropertiesRepresentationEvent (event) {
    this.drawPropertiesRepresentation(
      parseInt(event.returnValues.width, 10),
      lineCap(parseInt(event.returnValues.cap, 10)),
      hexToDashes(event.returnValues.dashes)
    );
  }

  drawPropertiesRepresentation (width, linecap, dasharray) {
    setLinePropertiesCss('properties', width, linecap, dasharray);
  }
}


class PropertiesGui extends Gui {
  constructor (properties) {
    super();
    this.properties = properties;
    this.onClickShowGui('representation');
    this.onClickHideGui('properties-gui-cancel');
    document.getElementById('properties-gui-update')
      .onclick = this.submitClickHandler.bind(this);
    document.getElementById('stroke-gui-width')
      .addEventListener('input', this.widthChanged.bind(this));
    document.getElementById('stroke-gui-linecap')
      .addEventListener('input', this.linecapChanged.bind(this));
    document.getElementById('stroke-gui-dasharray')
      .addEventListener('keyup', this.dasharrayChanged.bind(this));
  }

  widthChanged() {
    this.strokeWidth = document.getElementById('stroke-gui-width').value;
    document.getElementById(
      'stroke-gui-width-value'
    ).innerText = this.strokeWidth;
    this.drawPropertiesRepresentation();
  }

  linecapChanged () {
    this.lineCap = document.getElementById('stroke-gui-linecap').value;
    this.drawPropertiesRepresentation();
  }

  dasharrayChanged () {
    const dash = document.getElementById('stroke-gui-dasharray');
    dash.value = dash.value.replace(/[^0-9,]/g, '');
    this.dashes = dash.value
      .replace(/,+/g, ',')
      .split(',')
      .map(n => parseInt(n, 10))
      .filter(n => !Number.isNaN(n));
    this.drawPropertiesRepresentation();
  }

  // super.showGui() isn't async, but that's OK

  async showGui () {
    const [
      strokeWidth,
      lineCap,
      dashes
    ] = await this.properties.getBlockchainProperties();
    this.strokeWidth = strokeWidth;
    this.lineCap = lineCap;
    this.dashes = dashes;
    document.getElementById('stroke-gui-width').value = this.strokeWidth;
    document.getElementById(
      'stroke-gui-width-value'
    ).innerText = this.strokeWidth;
    document.getElementById('stroke-gui-linecap').value = this.lineCap;
    document.getElementById(
      'stroke-gui-dasharray'
    ).value = this.dashes.join(',');
    this.drawPropertiesRepresentation();
    super.showGui();
  }

  async submitClickHandler () {
    this.hideGui();
    this.showUpdating();
    try {
      await this.properties.setBlockchainProperties(
        this.strokeWidth,
        this.lineCap,
        '0x' + this.dashes.map(n => n.toString(16).padStart('0', 2)).join('')
      );
    } finally {
      this.hideUpdating();
    }
  }

  drawPropertiesRepresentation () {
    setLinePropertiesCss(
      'stroke-gui-preview-stroke',
      this.strokeWidth,
      this.lineCap,
      this.dashes
    );
  }
}


class HackLineProperties extends EthereumNetwork {
  async loadContracts() {
    this.propertiesContract = await this.loadContract(
      '../build/contracts/SecureLineProperties.json'
    );
  }

  async getBlockchainProperties () {
    const properties = await this.propertiesContract.methods
          .getProperties().call();
    return [
      parseInt(properties[0], 10),
      parseInt(properties[1], 10),
      hexToDashes(properties[2])
    ];
  }

  async setBlockchainProperties (width, cap, dashes) {
    const account = await this.tryForAccountAccess();
    await this.propertiesContract.methods.
      setProperties(width, cap, dashes).send({from: account});
  }

  registerLinePropertiesChangedHandler (callback) {
    this.propertiesContract.events.LineProperties().on('data', callback);
  }
}


////////////////////////////////////////////////////////////////////////////////
// Lifecycle
////////////////////////////////////////////////////////////////////////////////

document.addEventListener('DOMContentLoaded', async () => {
  const properties = await new HackLineProperties();
  properties.initializeWeb3();
  if (! properties.initialized) {
    document.write('Could not connect to Ethereum network');
  } else {
    await properties.loadContracts();
    const [width, cap, dashes] = await properties.getBlockchainProperties();
    const display = new PropertiesDisplay(properties);
    const gui = new PropertiesGui(properties);
    display.drawPropertiesRepresentation(width, cap, dashes);
  }
});
