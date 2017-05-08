import React from 'react';

const Symbol = props =>
  <div className="symbol">
    { props.symbol }
  </div>;

Symbol.propTypes = {
  symbol: React.PropTypes.string.isRequired
};

export default Symbol;
