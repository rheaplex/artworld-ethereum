pragma solidity ^0.4.4;

contract PayPreviousPath {

    int8[32] public pointX;
    int8[32] public pointY;
    // This would be an enum if compiler & ABI support made it easier
    uint8[32] public pointType;

    address public previousPayer;
    uint256 public previousPayerAmount;

    mapping (address => uint256) public pendingWithdrawals;

    event Path(int8[32] x, int8[32] y, uint8[32] t);

    function PayPreviousPath() public {
        previousPayer = msg.sender;
        // Start with a payment to the contract's creator
        previousPayerAmount = 0.001 ether;
        pendingWithdrawals[previousPayer] = previousPayerAmount;
    }

    function setPath(int8[32] x, int8[32] y, uint8[32] t) public payable {
        //require(msg.value > previousPayerAmount);
        //NOTE: we explicitly do not disallow the same sender setting the path
        //      multiple times (they may wish to change it), but we do not have
        //      any special logic to handle this. The sender must have the
        //      total amount for both payments available.
        pendingWithdrawals[previousPayer] += previousPayerAmount;
        previousPayer = msg.sender;
        previousPayerAmount = (msg.value - previousPayerAmount);
        pointX = x;
        pointY = y;
        pointType = t;
        Path(pointX, pointY, pointType);
    }

    function getCurrentPath() public view
        returns (int8[32] x, int8[32] y, uint8[32] t) {
        x = pointX;
        y = pointY;
        t = pointType;
    }

    function withdrawPreviousPayments() public {
        uint256 amount = pendingWithdrawals[msg.sender];
        if(amount > 0) {
            pendingWithdrawals[msg.sender] -= amount;
            msg.sender.transfer(amount);
        }
    }

}
