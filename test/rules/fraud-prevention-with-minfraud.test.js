const loadRule = require('../utils/load-rule');

const ruleName = 'fraud-prevention-with-minfraud';

describe(ruleName, () => {
  let rule;
  let request;
  let context;
  let user;
  let globals;
  let postCallback;

  beforeEach(() => {
    globals = {
      UnauthorizedError: function() {}
    };

    request = {
      post: jest.fn((uri, options, cb) => {
        postCallback = cb;
      })
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
    postCallback(null, { statusCode: 200 }, 'riskScore=0.25;someOtherValue=123');
  });

  it('should allow login if riskScore is <= 20', (done) => {
    rule(user, context, (err, u, c) => {
      expect(err).toBeNull;
      expect(u).toEqual(user);
      expect(c).toEqual(context);

      done();
    });
    postCallback(null, { statusCode: 200 }, 'riskScore=0.20;someOtherValue=123');
  });

  it('should allow login if riskScore is not set', (done) => {
    rule(user, context, (err, u, c) => {
      expect(err).toBeNull;
      expect(u).toEqual(user);
      expect(c).toEqual(context);

      done();
    });
    postCallback('some error', { statusCode: 200 }, 'someOtherValue=123');
  });

  it('should allow login on request error', (done) => {
    rule(user, context, (err, u, c) => {
      expect(err).toBeNull;
      expect(u).toEqual(user);
      expect(c).toEqual(context);

      done();
    });
    postCallback('some error', { statusCode: 200 }, 'riskScore=0.25;someOtherValue=123');
  });

  it('should allow login on non-200 status code', (done) => {
    rule(user, context, (err, u, c) => {
      expect(err).toBeNull;
      expect(u).toEqual(user);
      expect(c).toEqual(context);

      done();
    });
    postCallback(null, { statusCode: 400 }, 'riskScore=0.25;someOtherValue=123');
  });

});

