'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'signup';

describe(ruleName, () => {
  let context;
  let rule;
  const auth0 = {
    users: {
      updateAppMetadata: function(id, metadata) {
        expect(metadata.signed_up).toEqual(true);

        if (id === 'broken') {
          return Promise.reject(new Error('test update error'));
        }

        expect(id).toEqual('uid1');

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

  it('should do nothing if user is already signerUp', (done) => {
    rule({ app_metadata: { signed_up: true } }, context, (err, u, c) => {
      expect(err).toBeFalsy();
      expect(c).toEqual(context);

      done();
    });
  });

  it('should update app_metadata if user logged in for first time', (done) => {
    const user = {
      user_id: 'uid1',
      name: 'Terrified Duck',
      email: 'duck.t@example.com'
    };

    rule(user, context, (err, u, c) => {
      expect(err).toBeFalsy();
      expect(u.app_metadata.signed_up).toEqual(true);
      expect(c).toEqual(context);

      done();
    });
  });

  it('should return error if metadata update fails', (done) => {
    rule({ user_id: 'broken' }, context, (err) => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toEqual('test update error');

      done();
    });
  });
});
