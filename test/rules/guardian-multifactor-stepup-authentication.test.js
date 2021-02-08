'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'guardian-multifactor-stepup-authentication';

describe(ruleName, () => {
  let user;
  let context;
  let rule;

  beforeEach(() => {
    rule = loadRule(ruleName);
  });

  describe('acr_values set and context.authentication is not mfa', () => {
    beforeEach(() => {
      const request = new RequestBuilder()
        .withQuery({
          acr_values:
            'http://schemas.openid.net/pape/policies/2007/06/multi-factor'
        })
        .build();
      context = new ContextBuilder()
        .withRequest(request)
        .withAuthentication({
          methods: [ { name: 'not-mfa' } ]
        })
        .build();
    });

    it('sets the multifactor provider and allowRememberBrowser', (done) => {
      rule(user, context, (err, u, c) => {
        expect(c.multifactor.provider).toBe('any');
        expect(c.multifactor.allowRememberBrowser).toBe(false);

        done();
      });
    });
  });

  describe('request without acr_values', () => {
    beforeEach(() => {
      const request = new RequestBuilder().build();
      context = new ContextBuilder()
        .withRequest(request)
        .build();
    });

    it('does not set the multifactor context', (done) => {
      rule(user, context, (err, u, c) => {
        expect(c.multifactor).toBeFalsy();

        done();
      });
    });
  });

  describe('context.authentication is not set', () => {
    beforeEach(() => {
      const request = new RequestBuilder()
        .withQuery({
          acr_values:
            'http://schemas.openid.net/pape/policies/2007/06/multi-factor'
        })
        .build();
      context = new ContextBuilder()
        .withRequest(request)
        .withAuthentication(undefined)
        .build();
    });

    it('does nothing', (done) => {
      rule(user, context, (err, u, c) => {
        expect(c.multifactor).toBeFalsy();

        done();
      });
    });
  });
});
