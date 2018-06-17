'use strict';
const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const UserBuilder = require('../utils/userBuilder');

const ruleName = 'google-refresh-token';
describe(ruleName, () => {
  let rule;
  let context;
  let user;
  let globals;

  beforeEach(() => {
    globals = {
      auth0: {
        users: {
          updateAppMetadata: jest.fn()
        }
      },
      _: require('lodash')
    };

    user = new UserBuilder()
      .withIdentities([
        {
          provider: 'google-oauth2',
          refresh_token: 'token'
        }
      ])
      .build();

    context = new ContextBuilder().build();    

    rule = loadRule(ruleName, globals);
  });

  it('should set the refresh_token app metadata', (done) => {
    const updateAppMetadataMock = globals.auth0.users.updateAppMetadata;
    updateAppMetadataMock.mockReturnValue(Promise.resolve());
    
    rule(user, context, (e, u, c) => {
      const call = updateAppMetadataMock.mock.calls[0];
      expect(call[0]).toBe(user.user_id);
      expect(call[1].refresh_token).toBe(user.identities[0].refresh_token);

      done();
    });
  });
});
