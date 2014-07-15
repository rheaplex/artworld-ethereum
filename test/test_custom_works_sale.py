from ace.acetest import AceTest

class TestCustomWorksSale(AceTest):

    CONTRACT = "contract/custom_works_sale.se"
    CREATOR = "creator"

    def test_do_nothing(self):
        data = []
        ans = self.sim.tx(self.accounts["creator"], self.contract, 0, data)
        assert ans == []
