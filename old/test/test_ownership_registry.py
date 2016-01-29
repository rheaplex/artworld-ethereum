from ace.acetest import AceTest
from pyethereum.utils import coerce_to_bytes, coerce_to_int

class TestOwnershipRegistry(AceTest):
    
    CONTRACT = "contract/ownership_registry.se"
    CREATOR = "artist"
    
    ARTWORK_HASH = 0x76bba376ea574e63ab357b2374d1cee5aa77d24db38115e3824c5cc4f443d5f7

    def test_do_nothing(self):
        data = []
        response = self.sim.tx(self.accounts["beholder"], self.contract, 0, data)
        assert response[0] == 0

    def test_register_ownership(self):
        data = [self.ARTWORK_HASH]
        response = self.sim.tx(self.accounts["artist"], self.contract, 0, data)
        assert response[0] == 1

    def test_register_ownership_different_owner(self):
        data = [self.ARTWORK_HASH]
        response = self.sim.tx(self.accounts["artist"], self.contract, 0, data)
        assert response[0] == 1
        data = [self.ARTWORK_HASH]
        response = self.sim.tx(self.accounts["beholder"], self.contract, 0, data)
        assert response[0] == 0

