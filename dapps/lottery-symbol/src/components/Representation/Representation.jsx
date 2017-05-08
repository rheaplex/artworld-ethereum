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

import styles from './representation.scss';

// A Component to display a visual representation of the contract's state.

class Representation extends Component {

  // Set up our state (a placeholder symbol until we get the blockchain one).
  // this.state.symbol will be fetched and updated from the contract's value on
  // the blockchain.

  constructor(props) {
    super(props);
    this.state = {
      symbol: '…',
    };
  }

  // We only have our props once mounted, so only get the symbol from the
  // blockchain and register our listener on it once we can use the error
  // handler in the props.

  componentDidMount() {
    // Get the symbol from the contract and store it in our component state.
    this.props.contract.deployed()
      .then(instance => instance.symbol.call())
      .then((symbol) => {
        this.setState({ symbol: String.fromCharCode(symbol) });
      }).catch(error => this.props.error(error));
    // Watch the blockchain for changes in the symbol's state.
    this.props.contract.deployed()
      .then((instance) => {
        this.event = instance.SymbolChanged((error, result) => {
          if (!error) {
            this.setState({ symbol: String.fromCharCode(result.args.symbol) });
          } else {
            this.props.error(error);
          }
        });
      });
  }

  // Render the visual representation of the contract's state.

  render() {
    return (
      <div className={ styles.representation }>
        { this.state.symbol }
      </div>
    );
  }

}

// Contract's type is function.

Representation.propTypes = {
  contract: React.PropTypes.func.isRequired,
  error: React.PropTypes.func.isRequired,
};

// https://github.com/webpack/webpack/issues/1674

export default Representation;
