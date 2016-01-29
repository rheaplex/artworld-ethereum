from ace.acetest import AceTest
from pyethereum.utils import coerce_to_bytes

class TestHotCold(AceTest):
    
    CONTRACT = "contract/hot_cold.se"
    CREATOR = "artist"
    
    INDEX1000 = coerce_to_bytes(1000)
    INDEX1001 = coerce_to_bytes(1001)

    def test_initial_state(self):
        # Get storage data only returns int...
        assert self.sim.get_storage_dict(self.contract)[self.INDEX1000] == "hot"
        assert self.sim.get_storage_dict(self.contract)[self.INDEX1001] == "cold"

    def test_swap(self):
        data = []
        ans = self.sim.tx(self.accounts["artist"], self.contract, 0, data)
        assert ans == []
        # Get storage data only returns int...
        assert self.sim.get_storage_dict(self.contract)[self.INDEX1000] == "cold"
        assert self.sim.get_storage_dict(self.contract)[self.INDEX1001] == "hot"

    def test_double_swap(self):
        data = []
        ans = self.sim.tx(self.accounts["artist"], self.contract, 0, data)
        assert ans == []
        ans = self.sim.tx(self.accounts["artist"], self.contract, 0, data)
        assert ans == []
        # Get storage data only returns int...
        assert self.sim.get_storage_dict(self.contract)[self.INDEX1000] == "hot"
        assert self.sim.get_storage_dict(self.contract)[self.INDEX1001] == "cold"

