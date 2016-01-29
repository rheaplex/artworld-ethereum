from ace.acetest import AceTest
from pyethereum.utils import coerce_to_bytes

class TestOwnedWorkThatConfirmsOwner(AceTest):
    
    CONTRACT = "contract/owned_work_that_confirms_owner.se"
    CREATOR = "artist"

    OWNER = 0x7c8999dc9a822c1f0df42023113edb4fdd543266

    def test_owner(self):
        data = [self.OWNER]
        response = self.sim.tx(self.accounts["artist"], self.contract, 0, data)
        assert response[0] == 1

    def test_non_owner(self):
        data = [self.accounts["artist"].address]
        response = self.sim.tx(self.accounts["artist"], self.contract, 0, data)
        assert response[0] == 0

