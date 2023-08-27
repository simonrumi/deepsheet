const expect = require('chai').expect;
const sinon = require('sinon');
// need to require UserModel before requiring userHelpers
const mongoose = require('mongoose');
require('../../models/UserModel');
const { makeCookie, findUser } = require('../../helpers/userHelpers');

describe('User Helpers', () => {
   describe('makeCookie', () => {
      it('makeCookie with userdId and sessionId', () => {
         const cookie = makeCookie('myid123', 'mysession456');
         expect(cookie).to.equal('deepdeepsheet=I_myid123_S_mysession456; Max-Age=2592000');
      });

      it('makeCookie without a userId throws an error', () => {
         expect(() => makeCookie(null, 'mysession456')).to.throw();
      });

      it('makeCookie without a sessionId throws an error', () => {
         expect(() => makeCookie('myid123')).to.throw();
      });
   });

   describe('findUser', () => {
      it('findUser without a userIdFromProvider returns null', async () => {
         const result = await findUser({ userIdFromProvider: null, provider: 'facebook' });
         expect(result).to.equal(null);
      });

      it('findUser returns a user based on the userIdFromProvider', async () => {
         UserModel = mongoose.model('user'); // since before() and beforeEach() can't easily pass values to the it() function, a reasonable, readable way to do it is to just repeat this line when needed
         const fakeUser = { userIdFromProvider: '5', _id: '99', sessionId: '42' };
         const argsForFakeUser = { userIdFromProvider: '5', provider: 'facebook' };
         const userModelFindOne = sinon.stub(UserModel, 'findOne');
         userModelFindOne.withArgs(argsForFakeUser).returns(fakeUser);
         const result = await findUser(argsForFakeUser);
         sinon.assert.calledOnce(userModelFindOne);
         expect(result).to.equal(fakeUser);
         userModelFindOne.restore();
      });

      // const sheetModelFind = sinon.stub(UserModel, 'find');
      // sheetModelFind.returns(dummySheets);
      // const allSheets = await getAllSheets();
      // sinon.assert.calledOnce(sheetModelFind);
      // expect(allSheets).to.equal(dummySheets);
      // sheetModelFind.restore(); // should do this every time
   });
});
