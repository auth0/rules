'use strict';

const loadRule       = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const UserBuilder    = require('../utils/userBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'simple-user-whitelist';

describe(ruleName, () => {
  let context;
  let user;
  let rule;

  beforeEach(() => {
    rule = loadRule(ruleName, { UnauthorizedError: Error });

    const request = new RequestBuilder().build();
    user = new UserBuilder()
      .withEmail('denied@nope.com')
      .build();
    context = new ContextBuilder()
      .withRequest(request)
      .build();
  });

  it('should not authorize users without email', (done) => {
    user.email = '';
    rule(user, context, (e) => {
      expect(e).toBeInstanceOf(Error);
      expect(e.message).toEqual('Access denied.');
      done();
    });
  });

  it('should not authorize unverified users', (done) => {
    user.email_verified = false;
    rule(user, context, (e) => {
      expect(e).toBeInstanceOf(Error);
      expect(e.message).toEqual('Access denied.');
      done();
    });
  });

  it('should do nothing if user does have access', (done) => {
    user.email = 'user1@example.com';
    rule(user, context, (err, u, c) => {
      expect(err).toBeFalsy();
      expect(u).toEqual(user);
      expect(c).toEqual(context);
      done();
    });
  });

  it('should return error if user doesn`t have access', (done) => {
    rule(user, context, (err) => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toEqual('Access denied.');
      done();
    });
  });
});
