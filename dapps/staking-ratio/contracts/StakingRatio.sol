pragma solidity ^0.4.18;

contract StakingRatio {

    // Each user's staked amounts
    mapping (address => uint256) aStakes;
    mapping (address => uint256) bStakes;

    // The total amount staked
    uint256 public aAmount;
    uint256 public bAmount;

    // Emitted when the ratio changes
    event Ratio(uint256 a, uint256 b);

    function min(uint a, uint b) private pure returns (uint) {
        return a < b ? a : b;
    }

    function stakeA() public payable {
        if (msg.value > 0) {
            aStakes[msg.sender] += msg.value;
            aAmount += msg.value;
            Ratio(aAmount, bAmount);
        }
    }

    function stakeB() public payable {
        if (msg.value > 0) {
            bStakes[msg.sender] += msg.value;
            bAmount += msg.value;
            Ratio(aAmount, bAmount);
        }
    }

    function withdrawA(uint256 requestedAmount) public {
        uint256 amount = requestedAmount;
        if(amount == 0) {
            amount = aStakes[msg.sender];
        }
        if(amount > 0) {
            // Prevent theft and underflow
            amount = min(amount, aStakes[msg.sender]);
            aStakes[msg.sender] -= amount;
            aAmount -= amount;
            msg.sender.transfer(amount);
            Ratio(aAmount, bAmount);
        }
    }

    function withdrawB(uint256 requestedAmount) public {
        uint256 amount = requestedAmount;
        if(amount == 0) {
            amount = bStakes[msg.sender];
        }
        if(amount > 0) {
            // Prevent theft and underflow
            amount = min(amount, bStakes[msg.sender]);
            bStakes[msg.sender] -= amount;
            bAmount -= amount;
            msg.sender.transfer(amount);
            Ratio(aAmount, bAmount);
        }
    }

    function withdrawAll() public {
        uint256 amount = 0;
        if(aStakes[msg.sender] > 0) {
            amount += aStakes[msg.sender];
            aAmount -= aStakes[msg.sender];
            aStakes[msg.sender] = 0;
        }
        if(bStakes[msg.sender] > 0) {
            amount += bStakes[msg.sender];
            bAmount -= bStakes[msg.sender];
            bStakes[msg.sender] = 0;
        }
        if(amount > 0) {
            msg.sender.transfer(amount);
            Ratio(aAmount, bAmount);
        }
    }
}
