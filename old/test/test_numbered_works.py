from ace.acetest import AceTest
from pyethereum.utils import coerce_to_bytes

class TestNumberedWorks(AceTest):
    
    CONTRACT = "contract/numbered_works.se"
    CREATOR = "artist"
    
    INDEX1001 = coerce_to_bytes(1001)
    ARTWORK = "Work #"
    ARTWORK_NUMBER = 1

    def test_initial_state(self):
        # Get storage data only returns int...
        assert self.sim.get_storage_data(self.contract, self.INDEX1001) == 1

    def test_create_work(self):
        data = []
        response = self.sim.tx(self.accounts["beholder"], self.contract, 0, data)
        assert coerce_to_bytes(response[0]) == self.ARTWORK
        assert response[1] == self.ARTWORK_NUMBER
