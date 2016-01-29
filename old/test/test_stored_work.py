from ace.acetest import AceTest
from pyethereum.utils import coerce_to_bytes

class TestSimpleStoredWork(AceTest):

    CONTRACT = "contract/stored_work.se"
    CREATOR = "artist"

    WORK = "The art happens here."

    def test_work(self):
        data = []
        response = self.sim.tx(self.accounts["artist"], self.contract, 0, data)
        assert coerce_to_bytes(response[0]) == self.WORK

