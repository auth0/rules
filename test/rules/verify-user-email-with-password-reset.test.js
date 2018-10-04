'use strict';

const nock = require('nock');

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'verify-user-email-with-password-reset';

describe(ruleName, () => {
  let context;
  let rule;
  const user = {
    user_id: 'uid1',
    email: 'duck.t@example.com',
    name: 'Terrified Duck',
    nickname: 'T-Duck',
    picture: 'http://duckpic.com/someduck.pic'
  };

  const auth0 = {
    baseUrl: 'https://example.com',
    accessToken: 'accessToken'
  };

  beforeEach(() => {
    rule = loadRule(ruleName, { auth0 });

    const request = new RequestBuilder().build();
    context = new ContextBuilder()
      .withRequest(request)
      .build();
  });

  it('should do nothing if connectionStrategy isn`t auth0', (done) => {
    context.connectionStrategy = 'not-auth0';
    rule({}, context, (err) => {
      expect(err).toBeFalsy();
      done();
    });
  });

  it('should do nothing if email already verified', (done) => {
    context.connectionStrategy = 'auth0';

    rule({ email_verified: true }, context, (err) => {
      expect(err).toBeFalsy();
      done();
    });
  });

  it('should do nothing if password wasn`t updated', (done) => {
    context.connectionStrategy = 'auth0';

    rule({}, context, (err) => {
      expect(err).toBeFalsy();
      done();
    });
  });

  it('should update user and add email_verified to idToken', (done) => {
    nock('https://example.com', { reqheaders: { Authorization: 'Bearer accessToken' } })
      .intercept('/users/uid1', 'PATCH', (body) => {
        expect(body.email_verified).toEqual(true);
        return true;
      })
      .reply(200);

    rule({ user_id: 'uid1', last_password_reset: true }, context, (err, u, c) => {
      expect(err).toBeFalsy();
      expect(c.idToken.email_verified).toEqual(true);
      done();
    });
  });
});
