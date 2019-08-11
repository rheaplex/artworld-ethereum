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
        //FIXME: TEST PATH
        pointCommand[0] = 1;
        pointX[0] = 10;
        pointY[0] = 20;
        pointCommand[1] = 2;
        pointX[1] = 80;
        pointY[1] = 120;
        pointCommand[2] = 3;
        pointX1[2] = 12;
        pointY1[2] = 30;
        pointX2[2] = 40;
        pointY2[2] = 60;
        pointX[2] = 120;
        pointY[2] = 20;
        pointCommand[3] = 2 + T_CLOSEPATH;
        pointX[3] = 33;
        pointY[3] = 14;

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
