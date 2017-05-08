/*
 * Lottery Symbol - A symbol you can change via a lottery.
 * Copyright (C) 2017 Rob Myers <rob@robmyers.org>
 *
 * This file is part of Lottery Symbol.
 *
 * Lottery Symbol is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Lottery Symbol is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Lottery Symbol.  If not, see <http://www.gnu.org/licenses/>.
 */

import React, { Component } from 'react';
import { Button, ControlLabel, FormControl, FormGroup, HelpBlock, Modal,
       } from 'react-bootstrap';

import GasAccountChooser from '../GasAccountChooser/GasAccountChooser';

import styles from './gui.scss';

// The GUI to manipulate DApp state, interacting with the contract and the UI.

class Gui extends Component {

  // Set up our state and member variables, and bind our functions.

  constructor(props) {
    super(props);
    this.state = {
      symbol: '…',
    };
    this.gasAccount = null;
    this.gasAccountListError = this.gasAccountListError.bind(this);
    this.setGasAccount = this.setGasAccount.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
  }

  // We need the error handler so we can tell the user if anything goes wrong
  // fetching the symbol. This is only available once the component has mounted.

  componentDidMount() {
    this.props.contract.deployed()
      .then(instance => instance.symbol.call())
      .then(symbol => this.setState({ symbol: String.fromCharCode(symbol) }))
      .catch(err => this.props.error(err));
  }

  // The GasChooserComponent will call this to provide a default and if the user
  // selects an account.

  setGasAccount(account) {
    this.gasAccount = account;
  }

  // Validate the symbol for the FormGroup containing it.

  getSymbolValidationState() {
    let state = 'error';
    if (this.symbolIsValid()) {
      state = 'success';
    }
    return state;
  }

  // Make sure the user-provided "symbol" text isn't empty or multi-character.
  // I expect this to fail for many interesting scenarios, e.g. modifiers of
  // any kind.

  symbolIsValid() {
    return (this.state.symbol.length === 1)  // Correct length
      && (!this.state.symbol.match(/\s/)); // Not whitespace
  }

  // The user changed the text in the symbol-gui-symbol entry field, so handle
  // that.

  handleChange(event) {
    this.setState({ symbol: event.target.value });
  }

  // The user selected the "Update" button, so validate the symbol and the gas
  // account, and send the new symbol to the blockchain if everything's good.
  // The App will show Updating until it's mined, and then the Representation
  // will update to show the new value.

  handleUpdate() {
    if (this.symbolIsValid()
        && (this.gasAccount !== null)) {
      this.props.showUpdating();
      this.props.hideGui();
      this.props.contract.deployed()
        .then(instance => instance.updateSymbol(this.state.symbol.charCodeAt(0),
                                                { from: this.gasAccount }))
        .then(() => this.props.hideUpdating())
        .catch(err => this.props.error(err));
    }
    event.preventDefault();
  }

  // Intercept GasAccountList errors and fail/hide the GUI before passing them
  // on to the App error handler.

  gasAccountListError(err) {
    this.props.hideGui();
    this.props.error(err);
  }

  // Render the GUI in a Modal, displaying the symbol field, GasAccountChooser,
  // and Update/Cancel buttons.

  render() {
    return (
      <Modal
        className={ styles.gui }
        show={ this.props.show }
      >
        <Modal.Header>
          <Modal.Title>Update Symbol</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <FormGroup
              validationState={ this.getSymbolValidationState() }
            >
              <ControlLabel>Symbol</ControlLabel>
              <FormControl
                id="symbol-gui-symbol"
                type="text"
                maxLength="1"
                value={ this.state.symbol }
                onChange={ this.handleChange }
              />
              <HelpBlock>Any unicode character.</HelpBlock>
            </FormGroup>
            <GasAccountChooser
              web3={ this.props.web3 }
              setGasAccount={ this.setGasAccount }
              error={ this.gasAccountListError }
              help="Note that updating the symbol will cost gas!"
            />
            <Button
              bsStyle="primary"
              onClick={ this.handleUpdate }
              disabled={ !this.symbolIsValid() }
            >Update</Button>
            &nbsp;
            <Button
              bsStyle="default"
              onClick={ this.props.hideGui }
            >Cancel</Button>
          </form>
          <br />
          <p>To update the symbol, enter a new symbol in the text field above.
          Then press &quot;Update&quot;.</p>
          <p>If you do not wish to update the symbol, just press
          &quot;Cancel&quot;.</p>
        </Modal.Body>
      </Modal>
    );
  }

}

// Contract's type is function.
// We can't specify web3's type better than "object", unfortunately.

Gui.propTypes = {
  contract: React.PropTypes.func.isRequired,
  error: React.PropTypes.func.isRequired,
  hideGui: React.PropTypes.func.isRequired,
  hideUpdating: React.PropTypes.func.isRequired,
  show: React.PropTypes.bool.isRequired,
  showUpdating: React.PropTypes.func.isRequired,
  web3: React.PropTypes.object.isRequired,
};

// https://github.com/webpack/webpack/issues/1674

export default Gui;
