'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const loadRule = require('../utils/load-rule');

const ruleName = 'access-on-weekdays-only-for-an-app';

describe(ruleName, () => {
  let globals;
  let user;
  let context;
  let rule;

  beforeEach(() => {
    globals = {
      UnauthorizedError: function() {}
    };
    context = {
      clientName: 'TheAppToCheckAccessTo'
    };

    rule = loadRule(ruleName, globals);
  });

  describe('when day is weekend', () => {
    beforeEach(() => {
      global.Date.getDay = sinon.stub().returns(6);// jest.genMockFunction().mockReturnValue(6);
    })
    it('should return UnauthorizedError', (done) => {
      rule(user, context, (err, user, context) => {
        expect(err).to.be.instanceOf(globals.UnauthorizedError);
        done();
      });
    });
  })
  describe('when day is week day', () => {
    beforeEach(() => {
      global.Date.getDay = sinon.stub().returns(3);// jest.genMockFunction().mockReturnValue(3);
    })
    it('should return no error', (done) => {
      rule(user, context, (err, cbUser, cbContext) => {
        expect(err).to.be.null;
        expect(user).to.be.equal(user);
        expect(context).to.be.equal(context);
        done();
      });
    });
  })
});
