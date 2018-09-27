'use strict';

const nock = require('nock');

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'link-users-by-email';

describe(ruleName, () => {
  let context;
  let rule;
  const auth0 = {
    baseUrl: 'https://test.auth0.com',
    accessToken: 'access_token'
  };

  beforeEach(() => {
    rule = loadRule(ruleName, { auth0 }, { request: require('request') });
  });

  describe('should do nothing', () => {
    beforeEach(() => {
      const request = new RequestBuilder().build();
      context = new ContextBuilder()
        .withRequest(request)
        .build();
    });

    it('if no email data provided', (done) => {
      rule({}, context, (err, u, c) => {
        expect(err).toBeFalsy();
        done();
      });
    });

    it('if no email isn`t verified', (done) => {
      rule({ email: 'duck.t@example.com', email_verified: false }, context, (err, u, c) => {
        expect(err).toBeFalsy();
        done();
      });
    });

    it('if there is nothing to link', (done) => {
      const user = {
        user_id: 'uid1',
        email: 'duck.t@example.com',
        email_verified: true
      };

      nock('https://test.auth0.com')
        .get('/users-by-email')
        .query({ email: 'duck.t@example.com' })
        .reply(200, [ user ]);

      rule(user, context, (err, u, c) => {
        expect(err).toBeFalsy();
        done();
      });
    });
  });

  describe('should return error', () => {
    beforeEach(() => {
      const request = new RequestBuilder().build();
      context = new ContextBuilder()
        .withRequest(request)
        .build();
    });

    it('if search call fails', (done) => {
      const user = {
        user_id: 'uid1',
        email: 'duck.t@example.com',
        email_verified: true
      };

      nock('https://test.auth0.com')
        .get('/users-by-email')
        .query({ email: 'duck.t@example.com' })
        .reply(400);

      rule(user, context, (err, u, c) => {
        expect(err).toBeInstanceOf(Error);
        done();
      });
    });

    it('if there are too many users with same email', (done) => {
      const user = {
        user_id: 'uid1',
        email: 'duck.t@example.com',
        email_verified: true
      };

      const moreUsers = [
        {
          user_id: 'uid2',
          email: 'duck.t@example.com',
          email_verified: true
        },
        {
          user_id: 'uid3',
          email: 'duck.t@example.com',
          email_verified: true
        }
      ];

      nock('https://test.auth0.com')
        .get('/users-by-email')
        .query({ email: 'duck.t@example.com' })
        .reply(200, moreUsers);

      rule(user, context, (err, u, c) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toEqual('[!] Rule: Multiple user profiles already exist - cannot select base profile to link with');
        done();
      });
    });

    it('if update call fails', (done) => {
      const user = {
        user_id: 'uid1',
        email: 'duck.t@example.com',
        email_verified: true,
        identities: [ {
          provider: 'auth0',
          user_id: 'uid1'
        } ]
      };

      const moreUsers = [
        {
          user_id: 'uid2',
          email: 'duck.t@example.com',
          email_verified: true
        }
      ];

      nock('https://test.auth0.com')
        .get('/users-by-email')
        .query({ email: 'duck.t@example.com' })
        .reply(200, moreUsers);

      nock('https://test.auth0.com')
        .post('/users/uid2/identities')
        .reply(400);

      rule(user, context, (err, u, c) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toContain('Error linking account:');
        done();
      });
    });
  });

  describe('should link users', () => {
    beforeEach(() => {
      const request = new RequestBuilder().build();
      context = new ContextBuilder()
        .withRequest(request)
        .build();
    });

    it('if everything is ok', (done) => {
      const user = {
        user_id: 'uid1',
        email: 'duck.t@example.com',
        email_verified: true,
        identities: [ {
          provider: 'auth0',
          user_id: 'uid1'
        } ]
      };

      const moreUsers = [
        {
          user_id: 'uid2',
          email: 'duck.t@example.com',
          email_verified: true
        }
      ];

      nock('https://test.auth0.com', { reqheaders: { 'Authorization': 'Bearer access_token' } })
        .get('/users-by-email')
        .query({ email: 'duck.t@example.com' })
        .reply(200, moreUsers);

      nock('https://test.auth0.com', { reqheaders: { 'Authorization': 'Bearer access_token' } })
        .post('/users/uid2/identities', function(body) {
          expect(body.provider).toEqual('auth0');
          expect(body.user_id).toEqual('uid1');
          return true;
        })
        .reply(200);

      rule(user, context, (err, u, c) => {
        expect(err).toBeFalsy();
        expect(c.primaryUser).toEqual('uid2');
        done();
      });
    });
  });
});
