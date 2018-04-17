'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');

const loadRule = require('./util/load-rule.js');

describe.skip('fraud-prevention-with-minfraud', () => {
  let request;
  let rule;
  let user;

  beforeEach(() => {
    request = sinon.stub();

    const stubs = {
      request
    };

    user = {
    };

    rule = loadRule('fraud-prevention-with-minfraud', {}, stubs);
  });

  it('should return UnauthorizedError if riskScore is > 20', (done) => {
    request.callsArgWith(2, null, { statusCode: 200 }, 'riskScore=0.25;someOtherValue=123');

    rule(user, {}, (err, user, context) => {
      expect(err).to.have.property('name', 'UnauthorizedError');

      done();
    });
  });
});

