'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'guardian-multifactor-ip-range';

describe(ruleName, () => {
  let user;
  let context;
  let rule;

  beforeEach(() => {
    rule = loadRule(ruleName);
  });

  describe('should set multifactor provider', () => {
    beforeEach(() => {
      const request = new RequestBuilder().build();
      context = new ContextBuilder()
        .withRequest(request)
        .build();
    });

    it('if request contains acr_vales="http://schemas.openid.net/pape/policies/2007/06/multi-factor" and the context.authentication.methods array contains an element for name="mfa"', (done) => {
      rule(user, context, (err, u, c) => {
        expect(c.multifactor.provider).toBe('guardian');
        expect(c.multifactor.allowRememberBrowser).toBe(false);

        done();
      });
    });
  });

  describe('should do nothing', () => {
    beforeEach(() => {
      const request = new RequestBuilder().build();
      request.ip = '192.168.1.135';
      context = new ContextBuilder()
        .withRequest(request)
        .build();
    });

    it('if acr_values is not in request or if it is present, but not set to "http://schemas.openid.net/pape/policies/2007/06/multi-factor" or the context.authentication.methods array does not contain an element for name="mfa"', (done) => {
      rule(user, context, (err, u, c) => {
        expect(c.multifactor).toBeFalsy();

        done();
      });
    });
  });
});
