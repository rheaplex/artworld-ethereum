pragma solidity ^0.4.17;

contract SecureLineProperties {
  address public owner;

  uint256 public width;
  uint8   public cap;
  uint256 public dashes;

  event LineProperties(
      address setter,
      uint256 width,
      uint8 cap,
      uint256 dashes
  );

  modifier onlyOwner () {
    if (msg.sender == owner) _;
  }

  function SecureLineProperties () public {
    owner = msg.sender;
  }

  function setOwner (address newOwner) public onlyOwner {
      owner = newOwner;
  }

  /*
  function _setWidth (uint256 newWidth) {
      if (newWidth > 0 && newWidth <= 72) {
          width = newWidth;
      }
  }

  function _setCap (uint8 newCap) {
      if (newCap <= 2) {
          cap = newCap;
      }
  }

  function _setDashes (uint256 newDashes) {
      dashes = newDashes;
  }
  */
  
  function _setProperties (uint256 newWidth, uint8 newCap, uint256 newDashes) {
      width = newWidth;
      cap = newCap;
      dashes = newDashes;
      LineProperties(msg.sender, width, cap, dashes);
  }

  function setProperties (
      uint256 newWidth,
      uint8 newCap,
      uint256 newDashes
  )
      public
      onlyOwner
  {
      //_setWidth(newWidth);
      //_setCap(newCap);
      //_setDashed(newDashes);
      if (
          (newWidth > 0 && newWidth <= 72) &&
          (newCap <= 2)
          // Zero dashes == solid line, so don't check.
      ) {
          _setProperties(newWidth, newCap, newDashes);
      }
  }
}
