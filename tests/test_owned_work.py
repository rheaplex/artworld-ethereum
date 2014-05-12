from sim import Key, Simulator, load_serpent
from pyethereum.utils import coerce_to_bytes, coerce_to_int

class TestSimpleOwnedWork(object):

    ARTIST = Key('artist')
    OWNER = Key('owner')

    @classmethod
    def setup_class(cls):
        cls.code = load_serpent('serpent/owned_work.se')
        cls.sim = Simulator({cls.ARTIST.address: 10**18})

    def setup_method(self, method):
        self.sim.reset()
        self.contract = self.sim.load_contract(self.ARTIST, self.code)

    def test_owner(self):
        data = []
        response = self.sim.tx(self.ARTIST, self.contract, 0, data)
        print response
        assert response[0] == coerce_to_int(self.OWNER.address)

