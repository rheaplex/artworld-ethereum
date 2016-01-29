from ace.acetest import AceTest
from pyethereum.utils import coerce_to_bytes, coerce_to_int

class TestSimpleOwnedStoredWork(AceTest):
    
    CONTRACT = "contract/owned_stored_work.se"
    CREATOR = "artist"
    
    WORK = "The art happens here."

    def test_owner(self):
        data = ["owner"]
        response = self.sim.tx(self.accounts["beholder"], self.contract, 0, data)
        assert response[0] == coerce_to_int(self.accounts["artist"].address)

    def test_exhibit(self):
        data = ["work"]
        response = self.sim.tx(self.accounts["beholder"], self.contract, 0, data)
        assert coerce_to_bytes(response[0]) == self.WORK

    def test_bad_request(self):
        data = []
        response = self.sim.tx(self.accounts["beholder"], self.contract, 0, data)
        assert response[0] == 0

