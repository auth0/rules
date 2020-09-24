'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'slack';

describe(ruleName, () => {
  let context;
  let rule;
  let success;
  const configuration = {
    SLACK_HOOK_URL: 'YOUR SLACK HOOK URL'
  };
  const stubs = {
    'slack-notify': function(webhook) {
      expect(webhook).toEqual(configuration.SLACK_HOOK_URL);
      return { success };
    }
  };

  beforeEach(() => {
    rule = loadRule(ruleName, { configuration, UnauthorizedError: Error }, stubs);

    const request = new RequestBuilder().build();
    context = new ContextBuilder()
      .withRequest(request)
      .build();
  });

  it('should do nothing if loginsCount is more than 1', (done) => {
    rule({}, context, (err, u, c) => {
      expect(err).toBeFalsy();
      expect(c).toEqual(context);
      done();
    });
  });

  it('should do nothing if context.protocol is oauth2-refresh-token', (done) => {
    context.stats.loginsCount = 1;
    context.protocol = 'oauth2-refresh-token';

    rule({}, context, (err, u, c) => {
      expect(err).toBeFalsy();
      expect(c).toEqual(context);
      done();
    });
  });

  it('should send message to slack on new user signup', (done) => {
    context.stats.loginsCount = 1;
    context.protocol = 'oidc-basic-profile';

    const user = {
      user_id: 'uid1',
      email: 'duck.t@example.com',
      name: 'Terrified Duck'
    };

    success = function(options) {
      expect(options.text).toEqual('New User: ' + (user.name || user.email) + ' (' + user.email + ')');
      expect(options.channel).toEqual('#some_channel');
      done();
    };

    rule(user, context, (err, u, c) => {
      expect(err).toBeFalsy();
      expect(u).toEqual(user);
      expect(c).toEqual(context);
    });
  });
});
