from ace.acetest import AceTest    
from pyethereum.utils import coerce_to_bytes

class TestIsArt(AceTest):

    CONTRACT = "contract/is_art.se"
    CREATOR = "artist"

    def test_do_nothing(self):
        data = []
        ans = self.sim.tx(self.accounts["artist"], self.contract, 0, data)
        assert coerce_to_bytes(ans[0]) == "is not"

    def test_toggle(self):
        data = ["toggle"]
        ans = self.sim.tx(self.accounts["artist"], self.contract, 0, data)
        assert coerce_to_bytes(ans[0]) == "is"
        ans = self.sim.tx(self.accounts["artist"], self.contract, 0, data)
        assert coerce_to_bytes(ans[0]) == "is not"
