from sim import Key, Simulator, load_serpent
from pyethereum.utils import coerce_to_bytes

class TestHotCold(object):

    ARTIST = Key('artist')
    INDEX1000 = coerce_to_bytes(1000)
    INDEX1001 = coerce_to_bytes(1001)

    @classmethod
    def setup_class(cls):
        cls.code = load_serpent('serpent/hot_cold.se')
        cls.sim = Simulator({cls.ARTIST.address: 10**18})
        
    def setup_method(self, method):
        self.sim.reset()
        self.contract = self.sim.load_contract(self.ARTIST, self.code)

    def test_initial_state(self):
        # Get storage data only returns int...
        assert self.sim.get_storage_dict(self.contract)[self.INDEX1000] == "hot"
        assert self.sim.get_storage_dict(self.contract)[self.INDEX1001] == "cold"

    def test_swap(self):
        data = []
        ans = self.sim.tx(self.ARTIST, self.contract, 0, data)
        assert ans == []
        # Get storage data only returns int...
        assert self.sim.get_storage_dict(self.contract)[self.INDEX1000] == "cold"
        assert self.sim.get_storage_dict(self.contract)[self.INDEX1001] == "hot"

    def test_double_swap(self):
        data = []
        ans = self.sim.tx(self.ARTIST, self.contract, 0, data)
        assert ans == []
        ans = self.sim.tx(self.ARTIST, self.contract, 0, data)
        assert ans == []
        # Get storage data only returns int...
        assert self.sim.get_storage_dict(self.contract)[self.INDEX1000] == "hot"
        assert self.sim.get_storage_dict(self.contract)[self.INDEX1001] == "cold"

