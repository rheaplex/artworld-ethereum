from ace.acetest import AceTest
from pyethereum.utils import coerce_to_bytes, coerce_to_int

class TestCertificateOfAuthenticityURLHash(AceTest):
    
    CONTRACT = "contract/certificate_of_authenticity_url_hash.se"
    CREATOR = "artist"
    
    WORK_HASH = 0x76bba376ea574e63ab357b2374d1cee5aa77d24db38115e3824c5cc4f443d5f7
    URL_HASH = 0xa005b1625af0b6ee080dafb904c4505ad285764071ee45a8786159bd1a282634

    def test_do_nothing(self):
        data = []
        response = self.sim.tx(self.accounts["beholder"], self.contract, 0, data)
        assert response == []

    def test_authenticity(self):
        data = [self.WORK_HASH, self.URL_HASH]
        response = self.sim.tx(self.accounts["beholder"], self.contract, 0, data)
        assert response[0] == 1

    def test_authenticity_bad_hashes(self):
        data = [self.WORK_HASH + 1, self.URL_HASH + 1]
        response = self.sim.tx(self.accounts["beholder"], self.contract, 0, data)
        assert response[0] == 0


