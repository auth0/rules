'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'mfa';

describe(ruleName, () => {
  let user;
  let context;
  let rule;

  beforeEach(() => {
    rule = loadRule(ruleName);

    const request = new RequestBuilder().build();
    context = new ContextBuilder()
      .withRequest(request)
      .build();
  });

  it("should set multifactor provider to 'any'", (done) => {
    rule(user, context, (err, u, c) => {
      expect(c.multifactor.provider).toBe('any');
      expect(c.multifactor.allowRememberBrowser).toBe(false);

      done();
    });
  });
});
