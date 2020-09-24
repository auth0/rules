'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const UserBuilder = require('../utils/userBuilder')

const ruleName = 'disable-social-signup';
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
      }
    };

    user = new UserBuilder().build();

    rule = loadRule(ruleName, globals);
  });

  describe('when client is not enabled', () => {
    beforeEach(() => {
      context = new ContextBuilder().build();
    });

    it('should allow login/signup', (done) => {
      rule(user, context, (err, user, ctx) => {
        expect(err).toBeNull();
        expect(globals.auth0.users.updateAppMetadata.mock.calls.length).toBe(0);
        done();
      });
    });
  });

  describe('when first time social login', () => {
    beforeEach(() => {
      context = new ContextBuilder()
        .withClientId('REPLACE_WITH_YOUR_CLIENT_ID')
        .withStats({ loginsCount: 1 })
        .withConnection('social')
        .withConnectionStrategy('social')
        .build();

      globals.auth0.users.updateAppMetadata.mockReturnValue(Promise.resolve());
    });

    it('should disable signup', (done) => {
      rule(user, context, (err, user, ctx) => {
        expect(err).toBeInstanceOf(Error);
        expect(globals.auth0.users.updateAppMetadata.mock.calls[0][1].is_signup).toBe(true);
        done();
      });
    });
  });

  describe('when user app_metadata has is_signup set to true', () => {
    beforeEach(() => {
      context = new ContextBuilder()
        .withClientId('REPLACE_WITH_YOUR_CLIENT_ID')
        .build();

      user = new UserBuilder()
        .withAppMetadata({ is_signup: true })
        .build();
    });

    it('should disable signup', (done) => {
      rule(user, context, (err, user, ctx) => {
        expect(err).toBeInstanceOf(Error);
        done();
      });
    });
  });
});
