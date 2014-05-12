from sim import Key, Simulator, load_serpent
from pyethereum.utils import coerce_to_bytes

class TestSimpleStoredWork(object):

    ARTIST = Key('artist')
    WORK = open('tests/image_stored.pbm').read()

    @classmethod
    def setup_class(cls):
        cls.code = load_serpent('serpent/image_stored_work.se')
        cls.sim = Simulator({cls.ARTIST.address: 10**18})

    def setup_method(self, method):
        self.sim.reset()
        self.contract = self.sim.load_contract(self.ARTIST, self.code)

    def test_do_nothing(self):
        data = []
        response = self.sim.tx(self.ARTIST, self.contract, 0, data)
        assert response[0] == 0

    def test_exhibit(self):
        data = ["exhibit"]
        response = self.sim.tx(self.ARTIST, self.contract, 0, data)
        work = ''
        for fragment in response:
            work += coerce_to_bytes(fragment)
        image = open("tests/image_stored.pbm").read()
        assert work == image

