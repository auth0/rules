'use strict';
const loadRule = require('../utils/load-rule');

const ruleName = 'mixpanel-track-event';
describe(ruleName, () => {
  let request;
  let rule;
  let getCallback;

  beforeEach(() => {
    request = {
      get: jest.fn((uri, cb) => {
        getCallback = cb;
      })
    };

    const globals = {
      request
    };

    rule = loadRule(ruleName, globals);
  });

  it('should send mixpanel request', (done) => {
    const user = {
      user_id: '1234'
    };

    const context = {
      clientName: 'asdf'
    };

    rule(user, context, (err, user, context) => {
      const callOption = request.get.mock.calls[0][0];
      const data = JSON.parse(Buffer.from(callOption.qs.data, 'base64').toString('utf8'));

      expect(callOption).toHaveProperty('url', 'http://api.mixpanel.com/track/');
      expect(data).toEqual({
        event: 'Sign In',
        properties: {
          distinct_id: '1234',
          token: '{REPLACE_WITH_YOUR_MIXPANEL_TOKEN}',
          application: 'asdf'
        }
      });

      done();
    });

    getCallback(null, {}, {});

  });
});


