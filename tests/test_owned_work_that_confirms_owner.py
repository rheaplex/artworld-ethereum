from sim import Key, Simulator, load_serpent
from pyethereum.utils import coerce_to_bytes

class TestOwnedWorkThatConfirmsOwner(object):

    ARTIST = Key('artist')
    OWNER = Key('owner')

    @classmethod
    def setup_class(cls):
        cls.code = load_serpent('serpent/owned_work_that_confirms_owner.se')
        cls.sim = Simulator({cls.ARTIST.address: 10**18,
                             cls.OWNER.address: 10**18})

    def setup_method(self, method):
        self.sim.reset()
        self.contract = self.sim.load_contract(self.ARTIST, self.code)

    def test_owner(self):
        data = [self.OWNER.address]
        response = self.sim.tx(self.ARTIST, self.contract, 0, data)
        assert response[0] == 1

    def test_non_owner(self):
        data = [self.ARTIST.address]
        response = self.sim.tx(self.ARTIST, self.contract, 0, data)
        assert response[0] == 0

