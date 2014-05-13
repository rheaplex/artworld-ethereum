from sim import Key, Simulator, load_serpent
from pyethereum.utils import coerce_to_bytes

class TestCustomWorks(object):

    ARTIST = Key('artist') # 8802b7f0bfa5e9f5825f2fc708e1ad00d2c2b5d6
    BEHOLDER = Key('beholder') # 7e5188934964c0c267839653f7a49c879c2c8dfc
    ARTWORK_FOR_BEHOLDER = """<svg><rect x="23" y="23" height="123" width="123" style="fill:none;stroke:#2C8DFC;stroke-width:32" /></svg>"""

    @classmethod
    def setup_class(cls):
        cls.code = load_serpent('serpent/custom_works.se')
        cls.sim = Simulator({cls.ARTIST.address: 10**18,
                             cls.BEHOLDER.address: 10**18})

    def setup_method(self, method):
        self.sim.reset()
        self.contract = self.sim.load_contract(self.ARTIST, self.code)

    def test_do_nothing(self):
        data = []
        response = self.sim.tx(self.BEHOLDER, self.contract, 0, data)
        assert response[0] == 0

    def test_create_work(self):
        data = ["create"]
        response = self.sim.tx(self.BEHOLDER, self.contract, 0, data)
        artwork = "".join([coerce_to_bytes(fragment) for fragment in response])
        assert artwork == self.ARTWORK_FOR_BEHOLDER
        
