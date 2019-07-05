/* globals artifacts, assert, contract, it, web3 */

const ProofOfWorkBitmap = artifacts.require('./ProofOfWorkBitmap.sol')

// eb973b9198f3800302f3852035c716c79615ebea8924108ef718c53900000000  2db010cc

const one = web3.utils.toBN('1')

const calculatePow = (previousHash, bitmap, difficulty) => {
  let zeros = '0'.repeat(difficulty * 2)
  let nonce = web3.utils.toBN(one)
  let digest;
  for(;;nonce = nonce.add(one)) {
    digest = web3.utils.soliditySha3(
      {t: 'bytes32', v: previousHash},
      {t: 'bytes32', v: bitmap},
      {t: 'uint256', v: nonce}
    )
    if (digest.endsWith('00')) {
      console.log(digest + "\t" + nonce.toString(16))
    }
    if (digest.endsWith(zeros)) {
      break
    }
  }
  return [digest, `0x${nonce.toString('hex')}`]
}

contract('ProofOfWorkBitmap', () => {
  const initialBitmap = '0x1312423443534645645645745745674560000000000000000000000000000000'
  let initialHash = '0xeb973b9198f3800302f3852035c716c79615ebea8924108ef718c53900000000'
  let initialNonce = '0x2db010cc'
  let previousHash
  let instance
  
  before(async () => {
    instance = await ProofOfWorkBitmap.deployed()
    previousHash = (await instance.hash()).toString();
    [initialHash, initialNonce] = calculatePow(
      previousHash,
      initialBitmap,
      (await instance.difficulty()).toNumber()
    )
    console.log([initialHash, initialNonce])
  })

  it('should start with difficulty of 4 and everything else 0', async () => {
    assert.equal((await instance.difficulty()).toNumber(), 4)
    assert.equal((await instance.nonce()).toNumber(), 0)
    assert.equal((await instance.hash()).toString(), 0)
    assert.equal((await instance.height()).toNumber(), 0)
  })

  it('should validate a correct proof of work', async () => {
    assert.isTrue((await instance.validatePow(
      initialBitmap,
      initialNonce,
      initialHash
    )))
  })

  it('should set bitmap with correct proof of work', async () => {
    const receipt = await instance.setBitmap(
      initialBitmap,
      initialNonce,
      initialHash
    )
    assert.equal((await instance.bitmap()).toString(), initialBitmap)
    assert.equal(`0x${(await instance.nonce()).toString('hex')}`, initialNonce)
    assert.equal((await instance.hash()).toString(), initialHash)
    assert.equal(
      (await instance.height()).toNumber(),
      receipt.receipt.blockNumber
    )
    assert.equal((await instance.difficulty()).toNumber(), 8)
  })

  it('should not set bitmap with incorrect proof of work', async () => {
    try {
      await instance.setBitmap(
        initialBitmap,
        initialNonce,
        '0x0a'
      )
      assert.fail('incorrect PoW should fail')
    } catch (e) {
      assert.isTrue(e.message.endsWith('invalid proof-of-work.'))
    }
  })
})
