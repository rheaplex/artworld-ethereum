from ace.acetest import AceTest
from pyethereum.utils import coerce_to_bytes, coerce_to_int

class TestCertificateOfAuthenticity(AceTest):
    
    CONTRACT = "contract/certificate_of_authenticity.se"
    CREATOR = "artist"

    ARTWORK_HASH = 0x76bba376ea574e63ab357b2374d1cee5aa77d24db38115e3824c5cc4f443d5f7

    def test_do_nothing(self):
        data = []
        response = self.sim.tx(self.accounts["beholder"], self.contract, 0, data)
        assert response[0] == 0

    def test_authenticity(self):
        data = [self.accounts["artist"].address, self.ARTWORK_HASH]
        response = self.sim.tx(self.accounts["beholder"], self.contract, 0, data)
        assert response[0] == 1

    def test_authenticity_bad_artwork_hash(self):
        data = [self.accounts["artist"].address, self.ARTWORK_HASH + 1]
        response = self.sim.tx(self.accounts["beholder"], self.contract, 0, data)
        assert response[0] == 0

