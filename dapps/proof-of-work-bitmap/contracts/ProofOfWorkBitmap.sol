pragma solidity ^0.5.8;

//FIXME: make transferrible & drainable

contract ProofOfWorkBitmap {

    bytes32 public bitmap;
    uint256 public nonce;
    bytes32 public hash;
    uint256 public height;

    event BitmapChanged(
        address by,
        bytes32 bitmap,
        uint256 nonce,
        bytes32 hash
    );

    constructor() public {
        bitmap = 131242344353464564564574574567456;
    }

    function max(uint a, uint b) private pure returns (uint) {
        return a > b ? a : b;
    }

    // The number of *bytes* at the end of the hash that must be zero
    // This must always be at least 1, and has a maximum of 4 when the bitmap
    // is first set.
    // It reduces slowly over the next many blocks.
    function difficulty() public view returns (uint8 level) {
        level = uint8(max(1, 4 - ((block.number - height) / 12)));
    }

    function validatePow(
        bytes32 newBitmap,
        uint256 newNonce,
        bytes32 newHash
    )
        public view
        returns (bool valid)
    {
        // Is the hash correct?
        bytes32 bitmapNonceHash = keccak256(abi.encode(
           hash,
           newBitmap,
           newNonce
        ));
        valid = (bitmapNonceHash == newHash);
        // Does the hash have the correct number of trailing zero bytes?
        if (valid) {
            for (uint256 i = 31; i > 31 - difficulty(); i--) {
                if (bitmapNonceHash[i] != 0) {
                    valid = false;
                    break;
                }
            }
        }
    }

    // Check that the provided proof of work / puzzle solution is valid.
    // If so, set the bitmap.
    function setBitmap (
        bytes32 newBitmap,
        uint256 newNonce,
        bytes32 newHash
    )
        public
    {
        require(
            validatePow(newBitmap, newNonce, newHash),
            "invalid proof-of-work"
        );
        bitmap = newBitmap;
        nonce = newNonce;
        hash = newHash;
        height = block.number;
    }
}
