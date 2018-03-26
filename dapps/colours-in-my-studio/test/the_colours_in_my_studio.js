/* globals artifacts, assert, contract, it */

var TheColoursInMyStudio = artifacts.require('./TheColoursInMyStudio.sol')

contract('TheColoursInMyStudio', async accounts => {

  it('has default values', async () => {
    const instance = await TheColoursInMyStudio.deployed()
    const current = await instance.currentColours.call()
    assert.equal(current[0].length, 10)
    assert.equal(current[0][0].toNumber(), 0)
  })

  it('cannot be set by non-owner', async () => {
    const instance = await TheColoursInMyStudio.deployed()
    try {
      await instance.setColours(
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
        [110, 120, 130, 140, 150, 160, 170, 180, 190, 200],
        {from: accounts[1]}
      )
      assert.fail('Expected exception not caught.')
    } catch (exception) {
      // Do nothing
    }
    const current = await instance.currentColours.call()
    assert.equal(current[0].length, 10)
    assert.equal(current[0][0].toNumber(), 0)
    assert.equal(current[1][0].toNumber(), 0)
    assert.equal(current[2][0].toNumber(), 0)
    instance.Colours({}, {fromBlock: 0, toBlock: 'latest'})
      .get((error, logs) => {
        assert.equal(logs.length, 0)
      })
  })

  it('can be set by owner', async () => {
    const instance = await TheColoursInMyStudio.deployed()
    await instance.setColours(
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
      [110, 120, 130, 140, 150, 160, 170, 180, 190, 200]
    )
    const current = await instance.currentColours.call()
    assert.equal(current[0].length, 10)
    assert.equal(current[0][0].toNumber(), 0)
    assert.equal(current[1][0].toNumber(), 10)
    assert.equal(current[2][0].toNumber(), 110)
    instance.Colours({}, {fromBlock: 0, toBlock: 'latest'})
      .get((error, logs) => {
        assert.equal(logs.length, 1)
        assert.equal(logs[0].args.red.length, 10)
        assert.equal(logs[0].args.red[9], 9)
      })
  })

})
