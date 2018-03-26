pragma solidity ^0.4.17;

//FIXME: make transferrible & drainable

contract ProofOfWorkBitmap {

    uint256 public bitmap;
    uint256 public nonce;
    uint256 public hash;
    uint256 public height;

    event BitmapChanged(
        address by,
        uint256 bitmap,
        uint256 hash,
        uint256 nonce
    );

    function min(uint a, uint b) private pure returns (uint) {
        return a < b ? a : b;
    }

    // The number of *bytes* at the end of the hash that must be zero
    // This must always be at least 1, and has a maximum of 8 when the bitmap
    // is first set.
    // It reduces slowly over the next many blocks.
    function difficulty() public view returns (uint8 level) {
        level = uint8(min(1, (8 - ((block.number - height) / 10))));
    }

    function validatePow(
        uint256 newBitmap,
        uint256 newNonce,
        uint256 newHash
    ) public view returns ( bool valid ) {
        // Is the hash correct?
        bytes32 bitmapNonceHash = sha256(hash, newBitmap, newNonce);
        valid = (newHash == uint256(bitmapNonceHash));
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
        uint256 newBitmap,
        uint256 newNonce,
        uint256 newHash
    ) public returns ( bool ) {
        bool ok = validatePow(newBitmap, newNonce, newHash);
        if (ok) {
            bitmap = newBitmap;
            nonce = newHash;
            hash = newHash;
            height = block.number;
        }
        return ok;
    }
}
