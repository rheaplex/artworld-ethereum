pragma solidity ^0.4.18;

// Make sure this is a good idea
import 'zeppelin-solidity/contracts/ownership/CanreclaimToken.sol';
import 'zeppelin-solidity/contracts/ownership/Claimable.sol';
// Likewise. Don't we want to sell tokens?
import 'zeppelin-solidity/contracts/ownership/HasNoEther.sol';
import 'zeppelin-solidity/contracts/token/StandardToken.sol';


contract FourX is StandardToken, Claimable, CanReclaimToken, HasNoEther {

    // The number of permutations of items 1..4
    uint8 constant ORDERS_COUNT = 24;

    // In Python:
    // for i in itertools.permutations(list('ABCD'), 4):
    //     print '"%s",' % ''.join(i),
    // Hurry up solc and support constant array initializers and sizes
    string[24] ORDERS = [
        "ABCD", "ABDC", "ACBD", "ACDB", "ADBC", "ADCB",
        "BACD", "BADC", "BCAD", "BCDA", "BDAC", "BDCA",
        "CABD", "CADB", "CBAD", "CBDA", "CDAB", "CDBA",
        "DABC", "DACB", "DBAC", "DBCA", "DCAB", "DCBA"
    ];

    uint8 currentOrder;

    event CurrentOrderChanged(
        address changedBy,
        uint8 oldOrder,
        uint8 newOrder
    );

    function isOrderInRange (uint8 order) public pure returns (bool result) {
        result = order < ORDERS_COUNT;
    }

    function setNewOrder (uint8 newOrder) public {
        // Only token holders can set
        require(balanceOf(msg.sender) > 0);
        // The new order number mustn't be too high
        require(isOrderInRange(newOrder));
        uint8 oldOrder = currentOrder;
        currentOrder = newOrder;
        CurrentOrderChanged(msg.sender, oldOrder, currentOrder);
    }

    function FourX () public {
        // Ownable() sets the owner to be msg.sender

        //TODO: Send tokens to owner
        //TODO: Set initial state
    }
}
