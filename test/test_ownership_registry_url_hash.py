from ace.acetest import AceTest
from pyethereum.utils import coerce_to_bytes, coerce_to_int

class TestOwnershipRegistryURLHash(AceTest):

    CONTRACT = "contract/ownership_registry_url_hash.se"
    CREATOR = "artist"
    
    ARTWORK_HASH = 0x76bba376ea574e63ab357b2374d1cee5aa77d24db38115e3824c5cc4f443d5f7
    URL_HASH = 0xa005b1625af0b6ee080dafb904c4505ad285764071ee45a8786159bd1a282634

    def test_do_nothing(self):
        data = []
        response = self.sim.tx(self.accounts["beholder"], self.contract, 0, data)
        assert response[0] == 0

    def test_register_ownership(self):
        data = ["register", self.URL_HASH, self.ARTWORK_HASH]
        response = self.sim.tx(self.accounts["artist"], self.contract, 0, data)
        assert response[0] == 1

    def test_confirm_ownership(self):
        data1 = ["register", self.URL_HASH, self.ARTWORK_HASH]
        response = self.sim.tx(self.accounts["artist"], self.contract, 0, data1)
        assert response[0] == 1
        data2 = ["confirm", self.accounts["artist"].address, self.URL_HASH, self.ARTWORK_HASH]
        response = self.sim.tx(self.accounts["beholder"], self.contract, 0, data2)
        assert response[0] == 1

    def test_register_ownership_bad_artwork_hash(self):
        data1 = ["register", self.URL_HASH, self.ARTWORK_HASH]
        response = self.sim.tx(self.accounts["artist"], self.contract, 0, data1)
        assert response[0] == 1
        data2 = ["confirm", self.accounts["artist"].address, self.URL_HASH, self.ARTWORK_HASH + 1]
        response = self.sim.tx(self.accounts["beholder"], self.contract, 0, data2)
        assert response[0] == 0


    
