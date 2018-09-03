/*  SchellingFlags - Flags as focal points for aesthetics and ideology.
    Copyright (C) 2018  Rhea Myers <rob@Rhea Myers.org>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


/* global artifacts:false, assert:false, contract:false, it: false, web3:false
 */

const SchellingFlags = artifacts.require('SchellingFlags')

const flagColors = flag => flag[0].map(web3.toDecimal)
const flagLayout = flag => web3.toDecimal(flag[1])
const flagOverlay = flag => web3.toDecimal(flag[2])
const flagPledges = flag => web3.toDecimal(flag[3])

contract('SchellingFlags', accounts => {

  it('should allow the user to pledge and create a flag', async () => {
    const instance = await SchellingFlags.deployed()
    try {
      await instance.pledgeToFlagByProperties(2, 3, [1,2,3,4,5])
    } catch (error) {
      assert.isTrue(! error, 'Creating valid flag should not fail.')
    }
  })

  it('should allow the user to access flag properties', async () => {
    const instance = await SchellingFlags.deployed()
    const flag = await instance.getFlag(1)
    assert.equal(flagLayout(flag), 2)
    assert.equal(flagPledges(flag), 1)
    assert.deepEqual(flagColors(flag), [1,2,3,4,5, 0, 0])
  })
  
  it('should not allow user to access non-existens flags', async () => {
    // Although they can via the main flag array accessor because it uses
    // zero as the invalid flag.
    const instance = await SchellingFlags.deployed()
    try{
      await instance.getFlag.call(0)
      throw new Error('')
    } catch (error) {
      assert.isTrue(error.message.endsWith('revert'))
    }
    try{
      await instance.getFlag.call(9999999)
      throw new Error('')
    } catch (error) {
      assert.isTrue(error.message.endsWith('revert'))
    }
  })

  it('should not allow the user to pledge and create a bad flag', async () => {
    const instance = await SchellingFlags.deployed()
    try {
      await instance.pledgeToFlagByProperties(2000, 4, [1,2,3,4,5])
      throw new Error('')
    } catch (error) {
      assert.isTrue(error.message.endsWith('revert'))
    }
    try {
      await instance.pledgeToFlagByProperties(1, 5, [1000,2,3,4,5])
      throw new Error('')
    } catch (error) {
      assert.isTrue(error.message.endsWith('revert'))
    }
  })

  it('should allow the user to access and pledge a created flag', async () => {
    const instance = await SchellingFlags.deployed()
    await instance.pledgeToFlagByProperties(2, 3, [1,2,3,4,5])
    let flag = await instance.getFlag(1)
    assert.equal(flagPledges(flag), 2)
    await instance.pledgeToFlagById(1)
    flag = await instance.getFlag.call(1)
    assert.equal(flagPledges(flag), 3)
  })

  it('should update the most popular flags', async () => {
    const instance = await SchellingFlags.deployed()
    let zero = await instance.mostPopularFlags.call(0)
    assert.equal(zero, 1)
    let one = await instance.mostPopularFlags.call(1)
    assert.equal(one, 0)
    // Pledge 22 new flags, filling the most popular list and a little past
    for (let i = 0; i < 22; i++) {
      await instance.pledgeToFlagByProperties(5, 6, [i,2,3,4,5])
    }
    // Check that we filled the most popular list in the correct order
    for (let i = 0; i < 20; i++) {
      let favouriteId = await instance.mostPopularFlags.call(i)
      // Remember that flag IDs start at 1
      assert.equal(web3.toDecimal(favouriteId), (i + 1))
    }
    let nextId = web3.toDecimal(await instance.nextId.call())
    assert.equal(web3.toDecimal(nextId), 24)
    // Check that pledging a flag outside of the most popular list moves it on
    // to the list
    await instance.pledgeToFlagById(23)
    await instance.pledgeToFlagById(23)
    await instance.pledgeToFlagById(23)
    await instance.pledgeToFlagById(23)
    let newbie = await instance.mostPopularFlags.call(1)
    assert.equal(web3.toDecimal(newbie), 23)
    await instance.pledgeToFlagById(2)
    let otherNewbie = await instance.mostPopularFlags.call(2)
    assert.equal(web3.toDecimal(otherNewbie), 2)
 /*   for (let i = 0; i < 20; i++) {
      let id = await instance.mostPopularFlags.call(i)
      console.log(web3.toDecimal(id))
    }
    for (let i = 1; i < nextId; i++) {
      let flag = await instance.flags.call(i)
      console.log(i + ':' + web3.toDecimal(flagPledges(flag)))
    }*/
  })

})
