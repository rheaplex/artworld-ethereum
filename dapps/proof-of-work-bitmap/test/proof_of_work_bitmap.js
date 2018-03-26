/* globals artifacts, assert, contract, it, web3 */

const ProofOfWorkBitmap = artifacts.require('./ProofOfWorkBitmap.sol')

const crypto = require('crypto')

// eb973b9198f3800302f3852035c716c79615ebea8924108ef718c53900000000  2db010cc

// Convert the BigNumber to a Buffer containing its 256-bit representation

const bignum2uint256 = bignum => {
  const numstr = ('0000000000000000000000000000000000000000000000000000000000000000' + bignum.toString(16)).slice(-64)
  let bytes = new Uint8Array(32)
  for(let i = 0; i < 32; i++) {
    bytes[i] = parseInt(numstr.substring(i * 2, (i * 2) + 2), 16)
  }
  return Buffer.from(bytes.buffer)
}

const powHash = (previousNum, newNum, nonceNum) => {
  const hash = crypto.createHash('sha256')
  hash.update(previousNum)
  hash.update(newNum)
  hash.update(nonceNum)
  return hash.digest('hex')
}

const calculatePow = (previousHash, bitmap, numZeroBytes) => {
  let zeros = '0'.repeat(numZeroBytes * 2)
  let nonce = web3.toBigNumber('0')
  let digest;
  for(;;nonce = nonce.plus(1)) {
    digest = powHash(previousHash, bitmap, bignum2uint256(nonce))
    /*if (digest.endsWith('00')) {
      console.log(digest + "\t" + nonce.toString(16))
    }*/
    if (digest.endsWith(zeros)) {
      break
    }
  }
  return (digest, nonce.toString(16))
}

contract('ProofOfWorkBitmap', () => {

  it('should start with difficulty of 8', async () => {
    const instance = await ProofOfWorkBitmap.deployed()
    const difficulty = await instance.difficulty.call()
    const previousHash = bignum2uint256(web3.toBigNumber(0))
    const bitmap = bignum2uint256(web3.toBigNumber(
      '131242344353464564564574574567456'))
    const [digest, nonce] = calculatePow(previousHash, bitmap, 4);
    console.log(digest + "\t" + nonce)
  })

  it('should validate a correct proof of work', async () => {
    const instance = await ProofOfWorkBitmap.deployed()
    const difficulty = await instance.difficulty.call()
  })

})
