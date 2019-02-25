'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');
const AuthenticationBuilder = require('../utils/authenticationBuilder');

const ruleName = 'skip-mfa-during-silent-auth';

describe(ruleName, () => {
  let context;
  let rule;
  let user;

  describe('With only a login prompt completed', () => {
    beforeEach(() => {
      rule = loadRule(ruleName);
  
      const request = new RequestBuilder().build();
      const authentication = new AuthenticationBuilder().build();
      context = new ContextBuilder()
        .withRequest(request)
        .withAuthentication(authentication)
        .build();
    });

    it('should set a multifactor provider', (done) => {
      rule(user, context, (err, u, c) => {
        expect(c.multifactor.provider).toBe('any');
        expect(c.multifactor.allowRememberBrowser).toBe(false);

        done();
      });
    });
  });

  describe('With a login and MFA prompt completed', () => {
    beforeEach(() => {
      rule = loadRule(ruleName);
  
      const request = new RequestBuilder().build();
      const authentication = new AuthenticationBuilder()
        .withMethods([
          {
            name: 'pwd',
            timestamp: 1434454643024
          },
          {
            name: 'mfa',
            timestamp: 1534454643881
          }
        ])
        .build();
      context = new ContextBuilder()
        .withRequest(request)
        .withAuthentication(authentication)
        .build();
    });

    it('should not set a multifactor provider', (done) => {
      rule(user, context, (err, u, c) => {
        expect(c.multifactor).toBe(undefined);

        done();
      });
    });
  });
});
