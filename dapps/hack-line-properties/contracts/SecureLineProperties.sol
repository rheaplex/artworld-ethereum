pragma solidity ^0.4.17;

contract SecureLineProperties {
  address public owner;

  uint256 public width;
  uint8   public cap;
  bytes32 public dashes;

  event LineProperties(
      address setter,
      uint256 width,
      uint8 cap,
      bytes32 dashes
  );

  modifier onlyOwner () {
    if (msg.sender == owner) _;
  }

  function SecureLineProperties () public {
    owner = msg.sender;
    width = 24;
    cap = 1;
    dashes = 0x0F08;
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

    function _setDashes (bytes32 newDashes) {
    dashes = newDashes;
    }
  */
  
  function _setProperties (uint256 newWidth, uint8 newCap, bytes32 newDashes) {
      width = newWidth;
      cap = newCap;
      dashes = newDashes;
      LineProperties(msg.sender, width, cap, dashes);
  }

  function setProperties (
      uint256 newWidth,
      uint8 newCap,
      bytes32 newDashes
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

  function getProperties () public returns (uint256, uint8, bytes32) {
      return (width, cap, dashes);
  }
}
