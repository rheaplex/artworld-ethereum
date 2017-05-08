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
import { Button } from 'react-bootstrap';

import styles from './toggle.scss';

// An invisible, full-window Component button to toggle display of the GUI.

class Toggle extends Component {

  // Render a button, making it fill the window and be invisible using CSS.

  render() {
    return (
      <Button
        className={ styles.toggle }
        onClick={ this.props.showGui }
      />
    );
  }

}

// The function that will be called when the user clicks on the button.

Toggle.propTypes = {
  showGui: React.PropTypes.func.isRequired,
};

// https://github.com/webpack/webpack/issues/1674

export default Toggle;
