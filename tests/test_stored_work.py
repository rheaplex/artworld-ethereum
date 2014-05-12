from sim import Key, Simulator, load_serpent
from pyethereum.utils import coerce_to_bytes

class TestSimpleStoredWork(object):

    ARTIST = Key('artist')
    WORK = "The art happens here."

    @classmethod
    def setup_class(cls):
        cls.code = load_serpent('serpent/stored_work.se')
        cls.sim = Simulator({cls.ARTIST.address: 10**18})

    def setup_method(self, method):
        self.sim.reset()
        self.contract = self.sim.load_contract(self.ARTIST, self.code)

    def test_work(self):
        data = []
        response = self.sim.tx(self.ARTIST, self.contract, 0, data)
        assert coerce_to_bytes(response[0]) == self.WORK

