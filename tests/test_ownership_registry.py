from sim import Key, Simulator, load_serpent
from pyethereum.utils import coerce_to_bytes, coerce_to_int

class TestOwnershipRegistry(object):

    ARTIST = Key('artist') # 8802b7f0bfa5e9f5825f2fc708e1ad00d2c2b5d6
    BEHOLDER = Key('beholder') # 7e5188934964c0c267839653f7a49c879c2c8dfc
    ARTWORK_HASH = 0x76bba376ea574e63ab357b2374d1cee5aa77d24db38115e3824c5cc4f443d5f7

    @classmethod
    def setup_class(cls):
        cls.code = load_serpent('serpent/ownership_registry.se')
        cls.sim = Simulator({cls.ARTIST.address: 10**18,
                             cls.BEHOLDER.address: 10**18})

    def setup_method(self, method):
        self.sim.reset()
        self.contract = self.sim.load_contract(self.ARTIST, self.code)

    def test_do_nothing(self):
        data = []
        response = self.sim.tx(self.BEHOLDER, self.contract, 0, data)
        assert response[0] == 0

    def test_register_ownership(self):
        data = [self.ARTWORK_HASH]
        response = self.sim.tx(self.ARTIST, self.contract, 0, data)
        assert response[0] == 1

    def test_register_ownership_different_owner(self):
        data = [self.ARTWORK_HASH]
        response = self.sim.tx(self.ARTIST, self.contract, 0, data)
        assert response[0] == 1
        data = [self.ARTWORK_HASH]
        response = self.sim.tx(self.BEHOLDER, self.contract, 0, data)
        assert response[0] == 0

