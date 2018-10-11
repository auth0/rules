'use strict';

const nock = require('nock');

const loadRule       = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const UserBuilder    = require('../utils/userBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'roles-creation';

describe(ruleName, () => {
  let context;
  let user;
  let rule;

  const auth0 = {
    users: {
      updateAppMetadata: function (id, metadata) {
        if (id === 'broken') {
          return Promise.reject(new Error('test error'));
        }
        return Promise.resolve();
      }
    }
  };

  beforeEach(() => {
    rule = loadRule(ruleName, { auth0 });

    const request = new RequestBuilder().build();
    user = new UserBuilder()
      .withEmail('denied@nope.com')
      .build();
    context = new ContextBuilder()
      .withRequest(request)
      .build();
  });

  it('should do nothing if the user has no email', (done) => {
    user.email = '';
    rule(user, context, (e) => {
      expect(e).toBeFalsy();
      done();
    });
  });

  it('should do nothing if user`s email isn`t verified', (done) => {
    user.email_verified = false;
    rule(user, context, (e) => {
      expect(e).toBeFalsy();
      done();
    });
  });

  it('should return error if metadata update fails', (done) => {
    user.user_id = 'broken';
    rule(user, context, (err) => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toEqual('test error');
      done();
    });
  });

  it('should apply user role', (done) => {
    rule(user, context, (err, u, c) => {
      expect(err).toBeFalsy();
      expect(c.idToken['https://example.com/roles']).toEqual(['user']);
      done();
    });
  });

  it('should apply admin role', (done) => {
    user.email = 'admin@example.com';
    rule(user, context, (err, u, c) => {
      expect(err).toBeFalsy();
      expect(c.idToken['https://example.com/roles']).toEqual(['admin']);
      done();
    });
  });

});
