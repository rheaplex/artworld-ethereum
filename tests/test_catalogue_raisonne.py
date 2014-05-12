from sim import Key, Simulator, load_serpent
from pyethereum.utils import coerce_to_bytes, coerce_to_int

class TestCatalogueRaisonne(object):

    ARTIST = Key('artist') # 8802b7f0bfa5e9f5825f2fc708e1ad00d2c2b5d6
    BEHOLDER = Key('beholder') # 7e5188934964c0c267839653f7a49c879c2c8dfc
    COLLECTOR = Key('collector') # 64db9ead4f06be30dbf5e92894149235eff0cc65
    ARTWORK_HASH = 0x549f7755ce900c5e2f181b31477e19f0a4f16889
    OWNER_INDEX = 1001

    @classmethod
    def setup_class(cls):
        cls.code = load_serpent('serpent/catalogue_raisonne.se')
        cls.sim = Simulator({cls.ARTIST.address: 10**18,
                             cls.COLLECTOR.address: 10**18,
                             cls.BEHOLDER.address: 10**18})

    def setup_method(self, method):
        self.sim.reset()
        self.contract = self.sim.load_contract(self.ARTIST, self.code)

    def test_do_nothing(self):
        data = []
        response = self.sim.tx(self.BEHOLDER, self.contract, 0, data)
        assert response[0] == 0

    def test_add_work(self):
        data = [self.ARTWORK_HASH]
        response = self.sim.tx(self.ARTIST, self.contract, 0, data)
        assert response[0] == 1

    def test_add_work_without_permission(self):
        data = [self.ARTWORK_HASH]
        response = self.sim.tx(self.COLLECTOR, self.contract, 0, data)
        assert response[0] == 0

    def test_check_work(self):
        data = [self.ARTWORK_HASH]
        response = self.sim.tx(self.ARTIST, self.contract, 0, data)
        assert response[0] == 1
        data = [self.ARTWORK_HASH]
        response = self.sim.tx(self.BEHOLDER, self.contract, 0, data)
        assert response[0] == 1

    def test_check_work_not_included(self):
        data = [self.ARTWORK_HASH]
        response = self.sim.tx(self.ARTIST, self.contract, 0, data)
        assert response[0] == 1
        data = [self.ARTWORK_HASH + 1]
        response = self.sim.tx(self.BEHOLDER, self.contract, 0, data)
        assert response[0] == 0

