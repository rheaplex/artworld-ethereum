from ace.acetest import AceTest
from pyethereum.utils import coerce_to_bytes

class TestSimpleStoredWork(AceTest):
    
    CONTRACT = "contract/image_stored_work.se"
    CREATOR = "artist"
    
    WORK = open('test/image_stored.pbm').read()

    def test_do_nothing(self):
        data = []
        response = self.sim.tx(self.accounts["artist"], self.contract, 0, data)
        assert response[0] == 0

    def test_exhibit(self):
        data = ["exhibit"]
        response = self.sim.tx(self.accounts["artist"], self.contract, 0, data)
        print response
        work = ''
        for fragment in response:
            work += coerce_to_bytes(fragment)
        assert work == self.WORK

