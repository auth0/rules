'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'add-email-to-access-token';

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

  it('should add email to outgoing accessToken', (done) => {
    const user = {
      email: 'duck.t@example.com'
    };
    const namespace = 'http://example.com/';
    rule(user, context, (err, u, c) => {
      expect(c.accessToken[namespace + 'email']).toBe(user.email);

      done();
    });
  });
});
