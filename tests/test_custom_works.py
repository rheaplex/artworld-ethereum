from sim import Key, Simulator, load_serpent
from pyethereum.utils import coerce_to_bytes

class TestCustomWorks(object):

    ARTIST = Key('artist') # 8802b7f0bfa5e9f5825f2fc708e1ad00d2c2b5d6
    BEHOLDER = Key('beholder') # 7e5188934964c0c267839653f7a49c879c2c8dfc
    ARTWORK_LENGTH = 130

    @classmethod
    def setup_class(cls):
        cls.code = load_serpent('serpent/owned_stored_work.se')
        cls.sim = Simulator({cls.ARTIST.address: 10**18,
                             cls.BEHOLDER.address: 10**18})

    @classmethod
    def setup_class(cls):
        cls.code = load_serpent('serpent/custom_works.se')
        cls.sim = Simulator({cls.ARTIST.address: 10**18})

    def setup_method(self, method):
        self.sim.reset()
        self.contract = self.sim.load_contract(self.ARTIST, self.code)

    def test_size(self):
        data = ["size"]
        response = self.sim.tx(self.BEHOLDER, self.contract, 0, data)
        assert response[0] == self.ARTWORK_LENGTH
