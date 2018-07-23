pragma solidity ^0.4.22;

import 'openzeppelin-solidity/contracts/ownership/HasNoEther.sol';
import 'openzeppelin-solidity/contracts/ownership/HasNoTokens.sol';
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol';

contract SecretArtworks
is Ownable, HasNoEther, HasNoTokens,
    ERC721Token("SecretArtwork", "SECRET")
{
    uint constant public artworkCount = 12;
    
    mapping(uint256 => string) public secretIs;
    mapping(uint256 => bytes32) public secretHash;

    function createSecretArtwork(uint256 _id,
                                 string _secretIs,
                                 bytes32 _secretHash )
        public
        onlyOwner()
    {
        _mint(owner, _id);
        secretIs[_id] = _secretIs;
        secretHash[_id] = _secretHash;
    }

}
