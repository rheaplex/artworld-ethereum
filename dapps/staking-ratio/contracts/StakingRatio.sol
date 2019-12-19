pragma solidity ^0.5.0;


import "@openzeppelin/contracts/payment/escrow/Escrow.sol";


contract StakingRatio {
    // Emitted when the ratio changes
    event Ratio(uint256 a, uint256 b);

    Escrow aStakes;
    Escrow bStakes;

    // The total amount staked
    uint256 public totalAmountA;
    uint256 public totalAmountB;

    constructor() public {
        aStakes = new Escrow();
        bStakes = new Escrow();
    }

    function stakeA() external payable {
        if (msg.value > 0) {
            aStakes.deposit.value(msg.value)(msg.sender);
            totalAmountA += msg.value;
            emit Ratio(totalAmountA, totalAmountB);
        }
    }

    function stakeB() external payable {
        if (msg.value > 0) {
            bStakes.deposit.value(msg.value)(msg.sender);
            totalAmountB += msg.value;
            emit Ratio(totalAmountA, totalAmountB);
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
            totalAmountA -= withdrawal;
            emit Ratio(totalAmountA, totalAmountB);
            aStakes.withdraw(msg.sender);
        }
    }

    function withdrawB() external {
        uint256 withdrawal = bStakes.depositsOf(msg.sender);
        if (withdrawal > 0) {
            totalAmountB -= withdrawal;
            emit Ratio(totalAmountA, totalAmountB);
            bStakes.withdraw(msg.sender);
        }
    }

    // Copy and paste some code rather than make utility functions to share
    // with awkward logic and a larger attack surface.

    function withdrawAll() external {
        uint256 aWithdrawal = aStakes.depositsOf(msg.sender);
        if (aWithdrawal > 0) {
            totalAmountA -= aWithdrawal;
            aStakes.withdraw(msg.sender);
        }
        uint256 bWithdrawal = bStakes.depositsOf(msg.sender);
        if (bWithdrawal > 0) {
            totalAmountB -= bWithdrawal;
            bStakes.withdraw(msg.sender);
        }
        if ((aWithdrawal > 0) || (bWithdrawal > 0)) {
            emit Ratio(totalAmountA, totalAmountB);
        }
    }
}
