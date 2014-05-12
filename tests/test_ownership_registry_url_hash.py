from sim import Key, Simulator, load_serpent
from pyethereum.utils import coerce_to_bytes, coerce_to_int

class TestOwnershipRegistryURLHash(object):

    ARTIST = Key('artist') # 8802b7f0bfa5e9f5825f2fc708e1ad00d2c2b5d6
    BEHOLDER = Key('beholder') # 7e5188934964c0c267839653f7a49c879c2c8dfc
    COLLECTOR = Key('collector') # 64db9ead4f06be30dbf5e92894149235eff0cc65
    ARTWORK_HASH = 0x76bba376ea574e63ab357b2374d1cee5aa77d24db38115e3824c5cc4f443d5f7
    URL_HASH = 0xa005b1625af0b6ee080dafb904c4505ad285764071ee45a8786159bd1a282634

    @classmethod
    def setup_class(cls):
        cls.code = load_serpent('serpent/ownership_registry_url_hash.se')
        cls.sim = Simulator({cls.ARTIST.address: 10**18,
                             cls.BEHOLDER.address: 10**18,
                             cls.COLLECTOR.address: 10**18})

    def setup_method(self, method):
        self.sim.reset()
        self.contract = self.sim.load_contract(self.ARTIST, self.code)

    def test_do_nothing(self):
        data = []
        response = self.sim.tx(self.BEHOLDER, self.contract, 0, data)
        assert response[0] == 0

    def test_register_ownership(self):
        data = ["register", self.URL_HASH, self.ARTWORK_HASH]
        response = self.sim.tx(self.ARTIST, self.contract, 0, data)
        assert response[0] == 1

    def test_confirm_ownership(self):
        data1 = ["register", self.URL_HASH, self.ARTWORK_HASH]
        response = self.sim.tx(self.ARTIST, self.contract, 0, data1)
        assert response[0] == 1
        data2 = ["confirm", self.ARTIST.address, self.URL_HASH, self.ARTWORK_HASH]
        response = self.sim.tx(self.BEHOLDER, self.contract, 0, data2)
        assert response[0] == 1

    def test_register_ownership_bad_artwork_hash(self):
        data1 = ["register", self.URL_HASH, self.ARTWORK_HASH]
        response = self.sim.tx(self.ARTIST, self.contract, 0, data1)
        assert response[0] == 1
        data2 = ["confirm", self.ARTIST.address, self.URL_HASH, self.ARTWORK_HASH + 1]
        response = self.sim.tx(self.BEHOLDER, self.contract, 0, data2)
        assert response[0] == 0


    
