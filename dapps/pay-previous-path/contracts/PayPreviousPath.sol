pragma solidity ^0.5.0;


import "@openzeppelin/contracts/payment/PullPayment.sol";


/*
  NOTES
  =====
  - The x1 y1 x2 y2 x y order is from the SVG standard.
  - We use PullPayment because this works with real Ether.
 */


contract PayPreviousPath is PullPayment {
    // Use the low 4 bits for command, the high 4 bits for flags.
    // (We don't fill this space, but it's the schema).
    uint8 constant public T_MOVETO = 1;
    uint8 constant public T_LINETO = 2;
    uint8 constant public T_CURVETO_BEZIER = 3;
    // Not used but here in case
    uint8 constant public T_CURVETO_QUADRATIC = 4;
    // Added to another command, use the relative rather than absolute kind.
    // We don't use this but it's here as future proofing.
    uint8 constant public T_RELATIVE = 1 << 6;
    // On its own, closepath.
    // Added to another command, executes after the command it's added to.
    uint8 constant public T_CLOSEPATH = 1 << 7;

    event PathChanged(
        address indexed by,
        uint8[32] command,
        int8[32] x1,
        int8[32] y1,
        int8[32] x2,
        int8[32] y2,
        int8[32] x,
        int8[32] y
    );

    // In this house we use Bezier Curves.
    // This representation is unstructured and inflexible but clear and easy to
    // process. We don't want to allow invalid d="" specs or have to parse them
    // to validate them, so a string or bytes wouldn't work.
    // Just using Quadratics would take less room, the svg path T command would
    // take even less, but these remove control/fidelity/possibility.
    // The pointCommand is almost redundant, we could have a single path
    // consisting of Cs with an implicit M 0 0, but we want to be able to
    // represent more complex paths.
    uint8[32] public pointCommand;
    int8[32] public  pointX1;
    int8[32] public  pointY1;
    int8[32] public  pointX2;
    int8[32] public  pointY2;
    int8[32] public  pointX;
    int8[32] public  pointY;

    address public previousPayer;

    constructor() public {
        previousPayer = msg.sender;
        pointCommand[0] = 1;
        pointX[0] = -100;
        pointY[0] = -100;
        pointCommand[1] = 3;
        pointX[1] = 100;
        pointY[1] = 127;
        pointX1[1] = -100;
        pointY1[1] = 100;
        pointX2[1] = -120;
        pointY2[1] = 120;
        pointCommand[2] = 3;
        pointX[2] = 127;
        pointY[2] = 0;
        pointX1[2] = 23;
        pointY1[2] = 23;
        pointX2[2] = 127;
        pointY2[2] = 127;
        pointCommand[3] = 3;
        pointX[3] = 100;
        pointY[3] = 20;
        pointX1[3] = 100;
        pointY1[3] = 100;
        pointX2[3] = 33;
        pointY2[3] = 33;
        pointCommand[4] = 131;
        pointX[4] = -80;
        pointY[4] = -80;
        pointX1[4] = 80;
        pointY1[4] = -76;
        pointX2[4] = -10;
        pointY2[4] = -10;
        pointCommand[5] = 1;
        pointX[5] = 0;
        pointY[5] = 100;
        pointCommand[6] = 3;
        pointX[6] = -40;
        pointY[6] = -23;
        pointX1[6] = 90;
        pointY1[6] = 60;
        pointX2[6] = 25;
        pointY2[6] = 33;
        pointCommand[7] = 131;
        pointX[7] = 0;
        pointY[7] = 10;
        pointX1[7] = 40;
        pointY1[7] = -46;
        pointX2[7] = -3;
        pointY2[7] = -26;
        pointCommand[8] = 1;
        pointX[8] = -50;
        pointY[8] = 50;
        pointCommand[9] = 131;
        pointX[9] = -48;
        pointY[9] = 49;
        pointX1[9] = -60;
        pointY1[9] = 120;
        pointX2[9] = -127;
        pointY2[9] = 20;
        pointCommand[10] = 1;
        pointX[10] = -70;
        pointY[10] = -50;
        pointCommand[11] = 2;
        pointX[11] = -20;
        pointY[11] = 90;
    }

    function calculateFee (uint256 _gasPrice) public pure returns (uint256) {
        // This locks in the base transaction price but it's a schellingpoint
        return 2300 * _gasPrice;
    }

    function hasCorrectFee () internal returns (bool) {
        return msg.value == calculateFee(tx.gasprice);
    }

    //NOTE: We don't catch the case of setting the path to itself.

    function setPath(
        uint8[32] memory _command,
        int8[32] memory _x1,
        int8[32] memory _y1,
        int8[32] memory _x2,
        int8[32] memory _y2,
        int8[32] memory _x,
        int8[32] memory _y
    )
        public
        payable
    {
        // Pay the fee to the previous path setter
        uint256 fee = calculateFee(tx.gasprice);
        require(msg.value == fee, "Incorrect fee");
        _asyncTransfer(previousPayer, fee);
        previousPayer = msg.sender;
        // Set the path
        pointCommand = _command;
        pointX1 = _x1;
        pointY1 = _y1;
        pointX2 = _x2;
        pointY2 = _y2;
        pointX = _x;
        pointY = _y;
        emit PathChanged(
            msg.sender,
            pointCommand,
            pointX1,
            pointY1,
            pointX2,
            pointY2,
            pointX,
            pointY
        );
    }

    function getPath() external view
    returns (
        uint8[32] memory command,
        int8[32] memory x1,
        int8[32] memory y1,
        int8[32] memory x2,
        int8[32] memory y2,
        int8[32] memory x,
        int8[32] memory y
    ) {
        command = pointCommand;
        x1 = pointX1;
        y1 = pointY1;
        x2 = pointX2;
        y2 = pointY2;
        x = pointX;
        y = pointY;
    }
}
