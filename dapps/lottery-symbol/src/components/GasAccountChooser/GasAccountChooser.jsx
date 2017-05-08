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
import { ControlLabel, FormControl, FormGroup, HelpBlock,
       } from 'react-bootstrap';

import styles from './gasaccountchooser.scss';

// A Component that allows the user to choose one of their accounts to pay for
// gas.

class GasAccountChooser extends Component {

  // Set up state, bind functions.

  constructor(props) {
    super(props);
    this.state = {
      accounts: [],
    };
    this.handleChange = this.handleChange.bind(this);
  }

  // Once we're mounted we have access to the error dialog, so we only get the
  // accounts once we can tell the user if something goes wrong.

  componentDidMount() {
    this.props.web3.eth.getAccounts((err, accs) => {
      if (err != null) {
        this.props.error('There was an error fetching your accounts.');
      } else if (accs.length === 0) {
        this.props.error('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.');
      } else {
        this.setState({ accounts: accs });
        // Make sure there's a default account set if the user doesn't
        // explicitly choose one.
        this.props.setGasAccount(accs[0]);
      }
    });
  }

  // The user changed the account selection, so notify the interested party.

  handleChange(event) {
    this.props.setGasAccount(event.target.value);
    event.preventDefault();
  }

  // Render an html select with the accounts as options.

  render() {
    return (
      <div className={ styles.gasaccountchooser }>
        <FormGroup>
          <ControlLabel>Account to pay gas from</ControlLabel>
          <FormControl
            id="gui-gas-account"
            componentClass="select"
            onChange={ this.handleChange }
          >
            {
              this.state.accounts.map(account =>
                <option
                  key={ account }
                  value={ account }
                >{ account }</option>)
            }
          </FormControl>
          <HelpBlock>{ this.props.help }</HelpBlock>
        </FormGroup>
      </div>
    );
  }

}

// We can't specify web3's type better than "object", unfortunately.

GasAccountChooser.propTypes = {
  error: React.PropTypes.func.isRequired,
  help: React.PropTypes.string.isRequired,
  setGasAccount: React.PropTypes.func.isRequired,
  web3: React.PropTypes.object.isRequired,
};

// https://github.com/webpack/webpack/issues/1674

export default GasAccountChooser;
