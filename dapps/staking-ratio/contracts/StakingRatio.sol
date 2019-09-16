pragma solidity ^0.5.0;

import './AStakes.sol';
import './BStakes.sol';

contract StakingRatio {
    // Emitted when the ratio changes
    event Ratio(uint256 a, uint256 b);

    AStakes aStakes;
    BStakes bStakes;

    // The total amount staked
    uint256 public aAmount;
    uint256 public bAmount;

    constructor() public {
        aStakes = new AStakes();
        bStakes = new BStakes();
    }

    function stakeA() external payable {
        if (msg.value > 0) {
            aStakes.deposit.value(msg.value)(msg.sender);
            aAmount += msg.value;
            emit Ratio(aAmount, bAmount);
        }
    }

    function stakeB() external payable {
        if (msg.value > 0) {
            bStakes.deposit.value(msg.value)(msg.sender);
            bAmount += msg.value;
            emit Ratio(aAmount, bAmount);
        }
    }

    function myAStake() external view returns (uint256) {
        return aStakes.depositsOf(msg.sender);
    }

    function myBStake() external view returns (uint256) {
        return bStakes.depositsOf(msg.sender);
    }

    function withdrawA() external {
        uint256 withdrawal = aStakes.depositsOf(msg.sender);
        if (withdrawal > 0) {
            aAmount -= withdrawal;
            emit Ratio(aAmount, bAmount);
            aStakes.withdraw(msg.sender);
        }
    }

    function withdrawB() external {
        uint256 withdrawal = bStakes.depositsOf(msg.sender);
        if (withdrawal > 0) {
            bAmount -= withdrawal;
            emit Ratio(aAmount, bAmount);
            bStakes.withdraw(msg.sender);
        }
    }

    // Copy and paste some code rather than make utility functions to share
    // with awkward logic and a larger attack surface.
    
    function withdrawAll() external {
        uint256 aWithdrawal = aStakes.depositsOf(msg.sender);
        if (aWithdrawal > 0) {
            aAmount -= aWithdrawal;
            aStakes.withdraw(msg.sender);
        }
        uint256 bWithdrawal = bStakes.depositsOf(msg.sender);
        if (bWithdrawal > 0) {
            bAmount -= bWithdrawal;
            bStakes.withdraw(msg.sender);
        }
        if ((aWithdrawal > 0) || (bWithdrawal > 0)) {
            emit Ratio(aAmount, bAmount);
        }
    }
}
