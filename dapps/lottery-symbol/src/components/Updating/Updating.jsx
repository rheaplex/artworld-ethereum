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

import styles from './updating.scss';

// A Component that blocks the GUI toggle and displays an "Updating..." message.

class Updating extends Component {

  // Render the message depending on our "hidden" property.

  render() {
    let classNames = styles.updating;
    if (!this.props.updating) {
      classNames += ' hidden';
    }
    return (
      <div className={ classNames }>
        Updating&hellip;
      </div>
    );
  }

}

// Make sure we're getting a boolean value for the "updating" toggle.

Updating.propTypes = {
  updating: React.PropTypes.bool.isRequired,
};

// https://github.com/webpack/webpack/issues/1674

export default Updating;
