'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');

const loadRule = require('./util/load-rule.js');

describe('fraud-prevention-with-minfraud', () => {
  let rule;
  let request;
  let context;
  let user;
  let globals;

  beforeEach(() => {
    globals = {
      UnauthorizedError: function() {}
    };

    request = {
      post: sinon.stub()
    };

    const stubs = {
      request
    };

    user = {
      email: 'example@auth0.com'
    };

    context = {
      request: {
        ip: '123.123.123.123'
      }
    };

    rule = loadRule('fraud-prevention-with-minfraud', globals, stubs);
  });

  it('should return UnauthorizedError if riskScore is > 20', (done) => {
    request.post.callsArgWith(2, null, { statusCode: 200 }, 'riskScore=0.25;someOtherValue=123');

    rule(user, context, (err, u, c) => {
      expect(err).to.be.an.instanceof(globals.UnauthorizedError);

      done();
    });
  });

  it('should allow login if riskScore is <= 20', (done) => {
    request.post.callsArgWith(2, 'some error', { statusCode: 200 }, 'riskScore=0.20;someOtherValue=123');

    rule(user, context, (err, u, c) => {
      expect(err).to.be.null;
      expect(u).to.equal(user);
      expect(c).to.equal(context);

      done();
    });
  });

  it('should allow login if riskScore is not set', (done) => {
    request.post.callsArgWith(2, 'some error', { statusCode: 200 }, 'someOtherValue=123');

    rule(user, context, (err, u, c) => {
      expect(err).to.be.null;
      expect(u).to.equal(user);
      expect(c).to.equal(context);

      done();
    });
  });

  it('should allow login on request error', (done) => {
    request.post.callsArgWith(2, 'some error', { statusCode: 200 }, 'riskScore=0.25;someOtherValue=123');

    rule(user, context, (err, u, c) => {
      expect(err).to.be.null;
      expect(u).to.equal(user);
      expect(c).to.equal(context);

      done();
    });
  });

  it('should allow login on non-200 status code', (done) => {
    request.post.callsArgWith(2, null, { statusCode: 400 }, 'riskScore=0.25;someOtherValue=123');

    rule(user, context, (err, u, c) => {
      expect(err).to.be.null;
      expect(u).to.equal(user);
      expect(c).to.equal(context);

      done();
    });
  });

});

