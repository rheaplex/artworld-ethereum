/* global artifacts:false, assert:false, contract:false, it: false, web3:false
 */

const SecretArtworks = artifacts.require('SecretArtworks')

contract('SecretArtworks', accounts => {
  it("should have created initial artwork during migration", async () => {
    const instance = await SecretArtworks.deployed()
    const is = await instance.secretIs(1)
    assert.equal(is, 'content')
    const hash = await instance.secretHash(1)
    assert.equal(web3.toHex(hash), '0x1518e1270240a33b92f12e6f2a41b0c32820b5620d3a40034b99cd2b6e6d7556')
  });

  it("should allow the owner to create further artworks", async () => {
    const instance = await SecretArtworks.deployed()
    await instance.createSecretArtwork(2, 'form', '0x2518e1270240a33b92f12e6f2b41b0c32820b5620d3a40034b99cd2b6e6d7550')
    const is = await instance.secretIs(2)
    assert.equal(is, 'form')
    const hash = await instance.secretHash(2)
    assert.equal(web3.toHex(hash), '0x2518e1270240a33b92f12e6f2b41b0c32820b5620d3a40034b99cd2b6e6d7550')
  });

  it("should not allow the creation of duplicate artworks", async () => {
    const instance = await SecretArtworks.deployed()
    try {
      await instance.createSecretArtwork(2, 'form', '0x2518e1270240a33b92f12e6f2b41b0c32820b5620d3a40034b99cd2b6e6d7550')
      throw new Error('')
     } catch (error) {
       assert.isTrue(error.message.endsWith('revert'))
     }
  });

  it("should not allow non-owners to create further artworks", async () => {
    const instance = await SecretArtworks.deployed()
    try {
      await instance.createSecretArtwork(3, 'subject', '0x2518e1270240a33b92f12e6f2b41b0c32820b5620d3a40034b99cd2b6e6d7550', {'from': accounts[1]})
      throw new Error('')
    } catch (error) {
      assert.isTrue(error.message.endsWith('revert'))
    }
  });

});
