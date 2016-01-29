from ace.acetest import AceTest
from pyethereum.utils import coerce_to_bytes, coerce_to_int

class TestSimpleOwnedWork(AceTest):
    
    CONTRACT = "contract/owned_work.se"
    CREATOR = "artist"

    OWNER = 0x7c8999dc9a822c1f0df42023113edb4fdd543266
    
    def test_owner(self):
        data = []
        response = self.sim.tx(self.accounts["artist"], self.contract, 0, data)
        assert response[0] == coerce_to_int(self.OWNER)
