from ace.acetest import AceTest
from pyethereum.utils import coerce_to_bytes, coerce_to_int

class TestTransferrableStoredWork(AceTest):

    CONTRACT = "contract/transferrable_stored_work.se"
    CREATOR = "artist"
    
    WORK = "The art happens here."
    OWNER_INDEX = 1001

    def test_transfer(self):
        data = ["transfer", self.accounts["collector"].address]
        response = self.sim.tx(self.accounts["artist"], self.contract, 0, data)
        assert response[0] == 1

    def test_exhibit(self):
        data = ["exhibit"]
        response = self.sim.tx(self.accounts["beholder"], self.contract, 0, data)
        assert coerce_to_bytes(response[0]) == self.WORK

    def test_bad_request(self):
        data = []
        response = self.sim.tx(self.accounts["beholder"], self.contract, 0, data)
        assert response[0] == 0

