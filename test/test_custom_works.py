from ace.acetest import AceTest
from pyethereum.utils import coerce_to_bytes

class TestCustomWorks(AceTest):
    
    CONTRACT = "contract/custom_works.se"
    CREATOR = "artist"
    
    ARTWORK_FOR_BEHOLDER = """<svg><rect x="23" y="23" height="123" width="123" style="fill:none;stroke:#2C8DFC;stroke-width:32" /></svg>"""

    def test_do_nothing(self):
        data = []
        response = self.sim.tx(self.accounts["beholder"], self.contract, 0, data)
        assert response[0] == 0

    def test_create_work(self):
        data = ["create"]
        response = self.sim.tx(self.accounts["beholder"], self.contract, 0, data)
        artwork = "".join([coerce_to_bytes(fragment) for fragment in response])
        assert artwork == self.ARTWORK_FOR_BEHOLDER
