from sim import Key, Simulator, load_serpent
from pyethereum.utils import coerce_to_bytes

class TestNumberedWorks(object):

    ARTIST = Key('artist')
    AUDIENCE = Key('audience')
    INDEX1001 = coerce_to_bytes(1001)
    ARTWORK_LENGTH = 26
    ARTWORK_INSERT = 6

    @classmethod
    def setup_class(cls):
        cls.code = load_serpent('serpent/numbered_works.se')
        cls.sim = Simulator({cls.ARTIST.address: 10**18})

    def setup_method(self, method):
        self.sim.reset()
        self.contract = self.sim.load_contract(self.ARTIST, self.code)

    def test_initial_state(self):
        # Get storage data only returns int...
        assert self.sim.get_storage_data(self.contract, self.INDEX1001) == 0
