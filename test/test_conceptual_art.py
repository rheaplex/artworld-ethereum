from ace.acetest import AceTest

class TestConceptualArt(AceTest):
    
    CONTRACT = "contract/conceptual_art.se"
    CREATOR = "artist"

    def test_initial_state(self):
        # Get storage data only returns int...
        assert self.sim.get_storage_dict(self.contract) == {}

    def test_response(self):
        data = []
        ans = self.sim.tx(self.accounts["artist"], self.contract, 0, data)
        assert ans == []
        assert self.sim.get_storage_dict(self.contract) == {}

