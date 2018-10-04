'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'simple-whitelist-on-a-connection';

describe(ruleName, () => {
  let context;
  let rule;

  beforeEach(() => {
    rule = loadRule(ruleName, { UnauthorizedError: Error });

    const request = new RequestBuilder().build();
    context = new ContextBuilder()
      .withRequest(request)
      .build();
  });

  it('should do nothing if executed for other connection', (done) => {
    const user = {
      user_id: 'uid1',
      email: 'duck.t@example.com',
      name: 'Terrified Duck'
    };

    rule(user, context, (err, u, c) => {
      expect(err).toBeFalsy();
      expect(u).toEqual(user);
      expect(c).toEqual(context);
      done();
    });
  });

  it('should do nothing if user does have access', (done) => {
    context.connection = 'fitbit';
    const user = {
      user_id: 'uid2',
      email: 'user2@example.com',
      name: 'user2'
    };

    rule(user, context, (err, u, c) => {
      expect(err).toBeFalsy();
      expect(u).toEqual(user);
      expect(c).toEqual(context);
      done();
    });
  });

  it('should return error if user doesn`t have access', (done) => {
    context.connection = 'fitbit';
    const user = {
      user_id: 'uid1',
      email: 'duck.t@example.com',
      name: 'Terrified Duck'
    };

    rule(user, context, (err) => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toEqual('Access denied.');
      done();
    });
  });
});
