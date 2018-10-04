'use strict';

const nock = require('nock');

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'roles-creation';

describe(ruleName, () => {
  let context;
  let rule;

  const auth0 = {
    users: {
      updateAppMetadata: function (id, metadata) {
        if (id === 'broken') {
          return Promise.reject(new Error('test error'));
        }

        if (id === 'uid1') {
          expect(metadata.roles).toEqual(['admin']);
        } else {
          expect(metadata.roles).toEqual(['user']);
        }

        return Promise.resolve();
      }
    }
  };

  beforeEach(() => {
    rule = loadRule(ruleName, { auth0 });

    const request = new RequestBuilder().build();
    context = new ContextBuilder()
      .withRequest(request)
      .build();
  });

  it('should return error if metadata update fails', (done) => {
    rule({ user_id: 'broken' }, context, (err) => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toEqual('test error');

      done();
    });
  });

  it('should apply admin role', (done) => {
    const user = {
      user_id: 'uid1',
      name: 'Terrified Duck',
      email: 'duck.t@example.com'
    };

    rule(user, context, (err, u, c) => {
      expect(err).toBeFalsy();
      expect(c.idToken['https://example.com/roles']).toEqual(['admin']);

      done();
    });
  });

  it('should apply user role', (done) => {
    const user = {
      user_id: 'uid2',
      name: 'Terrified Duck',
      email: 'duck.t@ducks.com'
    };

    rule(user, context, (err, u, c) => {
      expect(err).toBeFalsy();
      expect(c.idToken['https://example.com/roles']).toEqual(['user']);

      done();
    });
  });
});
