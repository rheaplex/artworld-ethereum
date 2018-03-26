
contract DrawingTransactions {
    struct Drawing {
        address senderAddress;
        uint256 blockNumber
        uint256 drawingNonce;
    }

    uint256 contractDrawingNonce;

    mapping (address => array(Drawing)) drawings;

    function DrawingTransactions () {
        drawingNonce = 0;
    }

    public function commissionDrawing () {
        Drawing(sender.address, block.number, contractDrawingNonce);
        contractDrawingNonce += 1;
    }

}
