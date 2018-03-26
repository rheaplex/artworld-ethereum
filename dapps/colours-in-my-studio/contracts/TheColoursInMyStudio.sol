pragma solidity ^0.4.4;

contract owned {
    function owned() public { owner = msg.sender; }
    address owner;

    // This contract only defines a modifier but does not use
    // it: it will be used in derived contracts.
    // The function body is inserted where the special symbol
    // `_;` in the definition of a modifier appears.
    // This means that if the owner calls this function, the
    // function is executed and otherwise, an exception is
    // thrown.
    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }
}

contract TheColoursInMyStudio is owned {

    uint8[8] red;
    uint8[8] green;
    uint8[8] blue;

    // Use separate rgb arrays for Event compactness
    // Note we don't have a timestamp, the user must get block number and look
    // up timestamp for that block

    event Colours(uint8[8] red,
                  uint8[8] green,
                  uint8[8] blue);

    function currentColours() public view returns(uint8[8] currentRed,
                                                  uint8[8] currentGreen,
                                                  uint8[8] currentBlue) {
        currentRed = red;
        currentGreen = green;
        currentBlue = blue;
    }

    function setColours (uint8[8] newRed,
                         uint8[8] newGreen,
                         uint8[8] newBlue)
        public onlyOwner {
        red = newRed;
        green = newGreen;
        blue = newBlue;
        Colours(red, green, blue);
    }
}
