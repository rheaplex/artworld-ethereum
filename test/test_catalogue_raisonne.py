from ace.acetest import AceTest
from pyethereum.utils import coerce_to_bytes, coerce_to_int

class TestCatalogueRaisonne(AceTest):
    
    CONTRACT = "contract/catalogue_raisonne.se"
    CREATOR = "artist"

    ARTWORK_HASH = 0x549f7755ce900c5e2f181b31477e19f0a4f16889
    OWNER_INDEX = 1001

    def test_do_nothing(self):
        data = []
        response = self.sim.tx(self.accounts["beholder"], self.contract, 0, data)
        assert response[0] == 0

    def test_add_work(self):
        data = [self.ARTWORK_HASH]
        response = self.sim.tx(self.accounts["artist"], self.contract, 0, data)
        assert response[0] == 1

    def test_add_work_without_permission(self):
        data = [self.ARTWORK_HASH]
        response = self.sim.tx(self.accounts["collector"], self.contract, 0, data)
        assert response[0] == 0

    def test_check_work(self):
        data = [self.ARTWORK_HASH]
        response = self.sim.tx(self.accounts["artist"], self.contract, 0, data)
        assert response[0] == 1
        data = [self.ARTWORK_HASH]
        response = self.sim.tx(self.accounts["beholder"], self.contract, 0, data)
        assert response[0] == 1

    def test_check_work_not_included(self):
        data = [self.ARTWORK_HASH]
        response = self.sim.tx(self.accounts["artist"], self.contract, 0, data)
        assert response[0] == 1
        data = [self.ARTWORK_HASH + 1]
        response = self.sim.tx(self.accounts["beholder"], self.contract, 0, data)
        assert response[0] == 0

