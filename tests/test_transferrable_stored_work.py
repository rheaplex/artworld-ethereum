from sim import Key, Simulator, load_serpent
from pyethereum.utils import coerce_to_bytes, coerce_to_int

class TestTransferrableStoredWork(object):

    ARTIST = Key('artist') # 8802b7f0bfa5e9f5825f2fc708e1ad00d2c2b5d6
    BEHOLDER = Key('beholder') # 7e5188934964c0c267839653f7a49c879c2c8dfc
    COLLECTOR = Key('collector') # 64db9ead4f06be30dbf5e92894149235eff0cc65
    WORK = "The art happens here."
    OWNER_INDEX = 1001

    @classmethod
    def setup_class(cls):
        cls.code = load_serpent('serpent/transferrable_stored_work.se')
        cls.sim = Simulator({cls.ARTIST.address: 10**18,
                             cls.COLLECTOR.address: 10**18,
                             cls.BEHOLDER.address: 10**18})

    def setup_method(self, method):
        self.sim.reset()
        self.contract = self.sim.load_contract(self.ARTIST, self.code)

    def test_transfer(self):
        data = ["transfer", self.COLLECTOR.address]
        response = self.sim.tx(self.ARTIST, self.contract, 0, data)
        assert response[0] == 1

    def test_exhibit(self):
        data = ["exhibit"]
        response = self.sim.tx(self.BEHOLDER, self.contract, 0, data)
        print response
        assert coerce_to_bytes(response[0]) == self.WORK

    def test_bad_request(self):
        data = []
        response = self.sim.tx(self.BEHOLDER, self.contract, 0, data)
        assert response[0] == 0

