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
import Dialog from 'react-bootstrap-dialog';

import styles from './app.scss';

import Gui from './components/Gui/Gui';
import Representation from './components/Representation/Representation';
import Toggle from './components/Toggle/Toggle';
import Updating from './components/Updating/Updating';

// The main application view Component.

class App extends Component {

  // set up out state and bind our functions

  constructor(props) {
    super(props);
    this.state = {
      updating: false,
      guiVisible: false,
    };
    this.error = this.error.bind(this);
    this.showGui = this.showGui.bind(this);
    this.hideGui = this.hideGui.bind(this);
    this.showUpdating = this.showUpdating.bind(this);
    this.hideUpdating = this.hideUpdating.bind(this);
  }

  // Display the GUI over the representation.

  showGui() {
    if ((!this.state.updating)
        && (!this.state.guiVisible)) {
      this.setState({ guiVisible: true });
    }
  }

  // Hide the GUI.

  hideGui() {
    if (this.state.guiVisible) {
      this.setState({ guiVisible: false });
    }
  }

  // Show the "Updating..." message (that blocks the Gui until the update is
  // finished).

  showUpdating() {
    if (!this.state.updating) {
      this.setState({ updating: true });
    }
  }

  // Hide the "Updating..." message (re-enabling the Gui).

  hideUpdating() {
    if (this.state.updating) {
      this.setState({ updating: false });
    }
  }

  // Show an error dialog. We pass this in to child components so they can all
  // notify the user of errors in a standard way.

  error(err) {
    this.dialog.showAlert(<div><h4>Error!</h4><p>{ err }</p></div>);
  }

  // Render the App containing the dialog, "Updating..." notice, the
  // Representation of the contract's state, the Toggle for the GUI and the
  // GUI itself, passing in various useful objects to them.

  render() {
    return (
      <div className={ styles.app }>
        <Dialog ref={ (c) => { this.dialog = c; } } />
        <Updating updating={ this.state.updating } />
        <Representation
          contract={ this.props.contract }
          error={ this.error }
        />
        <Toggle showGui={ this.showGui } />
        <Gui
          contract={ this.props.contract }
          dialog={ this.dialog }
          error={ this.error }
          hideGui={ this.hideGui }
          hideUpdating={ this.hideUpdating }
          show={ this.state.guiVisible }
          showUpdating={ this.showUpdating }
          web3={ this.props.web3 }
        />
      </div>
    );
  }
}

// We can't specify web3's type better than "object", unfortunately.

App.propTypes = {
  contract: React.PropTypes.func.isRequired,
  web3: React.PropTypes.object.isRequired,
};

// https://github.com/webpack/webpack/issues/1674

export default App;
