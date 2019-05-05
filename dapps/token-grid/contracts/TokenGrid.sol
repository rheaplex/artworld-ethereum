pragma solidity ^0.5.0;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol';


contract TokenGrid is ERC20, ERC20Detailed('TokenGrid', 'TGRID', 0), Ownable {
    // 32 uint8 each, packed as uint256 left-to-right.
    // Cannot guarantee order, clients must remove zeros and sort.
    // Start with some demonstration values
    uint256 public rows = 0x0001040810204080FF;
    uint256 public columns = 0x00010810182028505860687078808890E0E8F0F8FF;
    
    event Grid(uint256 rows, uint256 columns);
    
    function setGrid (uint256 _rows, uint256 _columns) external {
        require(balanceOf(msg.sender) > 0, "Must have token to burn");
        rows = _rows;
        columns = _columns;
        emit Grid(rows, columns);
        _burn(msg.sender, 1);
    }
    
    function requestToken () external {
        require(balanceOf(msg.sender) < 10, "Don't be greedy");
        _mint(msg.sender, 1);
    }
}
