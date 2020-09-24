'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const UserBuilder = require('../utils/userBuilder');

const ruleName = 'duo-multifactor';

describe(ruleName, () => {
  let user;
  let context;
  let rule;
  let globals;

  globals = {
    configuration: {
      DUO_IKEY: 'DIXBMN...LZO8IOS8',
      DUO_SKEY: 'nZLxq8GK7....saKCOLPnh',
      DUO_HOST: 'api-3....049.duosecurity.com'
    }
  };

  beforeEach(() => {
    rule = loadRule(ruleName, globals);

    user = new UserBuilder().build();
  });

  describe('when client is MFA enabled', () => {
    beforeEach(() => {
      context = new ContextBuilder()
        .withClientId('REPLACE_WITH_YOUR_CLIENT_ID')
        .build();
    })
    it('should allow access', (done) => {
      rule(user, context, (err, user, ctx) => {
        expect(ctx.multifactor.provider).toBe('duo');

        done();
      });
    });
  });
  describe('when client is not MFA enabled', () => {
    beforeEach(() => {
      context = new ContextBuilder().build();
    })
    it('should not allow access', (done) => {
      rule(user, context, (err, user, ctx) => {
        expect(ctx.multifactor).toBeUndefined();

        done();
      });
    });
  });
});
