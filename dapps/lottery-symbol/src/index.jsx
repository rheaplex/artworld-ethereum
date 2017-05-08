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

import React from 'react';
import ReactDOM from 'react-dom';

import 'bootstrap/dist/css/bootstrap.css';

import Web3 from 'web3';
import contract from 'truffle-contract';

import artefacts from '../contracts/LotterySymbol.sol';

import App from './App';

import './index.scss';

// Keep ESLint happy.
/* global web3 */

// onLoad we should have a web3 object to use, check this and pass it in to our
// App along with the contract we are using, or try to create one.

window.addEventListener('load', () => {
  let provider;
  let theWeb3;
  if (typeof web3 !== 'undefined') {
    provider = web3.currentProvider;
    theWeb3 = web3;
  } else {
    provider = new Web3.providers.HttpProvider('http://localhost:8545');
    theWeb3 = new Web3(provider);
  }

  const theContract = contract(artefacts);
  theContract.setProvider(provider);

  ReactDOM.render(
    <App
      contract={ theContract }
      web3={ theWeb3 }
    />,
    document.getElementById('root'),
  );
});
