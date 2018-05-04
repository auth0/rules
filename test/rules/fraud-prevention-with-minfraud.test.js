'use strict';

const loadRule = require('../utils/load-rule');

const ruleName = 'fraud-prevention-with-minfraud';

describe(ruleName, () => {
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
      post: jest.fn()
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

    rule = loadRule(ruleName, globals, stubs);
  });

  it('should return UnauthorizedError if riskScore is > 20', (done) => {
    rule(user, context, (err, u, c) => {
      expect(err).toBeInstanceOf(globals.UnauthorizedError);

      done();
    });
    request.post.mock.calls[0][2](null, { statusCode: 200 }, 'riskScore=0.25;someOtherValue=123');
  });

  it('should allow login if riskScore is <= 20', (done) => {
    rule(user, context, (err, u, c) => {
      expect(err).toBeNull;
      expect(u).toEqual(user);
      expect(c).toEqual(context);

      done();
    });
    request.post.mock.calls[0][2](null, { statusCode: 200 }, 'riskScore=0.20;someOtherValue=123');
  });

  it('should allow login if riskScore is not set', (done) => {
    rule(user, context, (err, u, c) => {
      expect(err).toBeNull;
      expect(u).toEqual(user);
      expect(c).toEqual(context);

      done();
    });
    request.post.mock.calls[0][2]('some error', { statusCode: 200 }, 'someOtherValue=123');
  });

  it('should allow login on request error', (done) => {
    rule(user, context, (err, u, c) => {
      expect(err).toBeNull;
      expect(u).toEqual(user);
      expect(c).toEqual(context);

      done();
    });
    request.post.mock.calls[0][2]('some error', { statusCode: 200 }, 'riskScore=0.25;someOtherValue=123');
  });

  it('should allow login on non-200 status code', (done) => {
    rule(user, context, (err, u, c) => {
      expect(err).toBeNull;
      expect(u).toEqual(user);
      expect(c).toEqual(context);

      done();
    });
    request.post.mock.calls[0][2](null, { statusCode: 400 }, 'riskScore=0.25;someOtherValue=123');
  });

});

