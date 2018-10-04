'use strict';

const nock = require('nock');

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'zapier-new-login';

describe(ruleName, () => {
  let context;
  let rule;

  const stubs = {
    lodash: {
      extend: (result, first, second) => {
        return Object.assign(result, first, second);
      }
    }
  };

  beforeEach(() => {
    rule = loadRule(ruleName, {}, stubs);

    const request = new RequestBuilder().build();
    context = new ContextBuilder()
      .withRequest(request)
      .build();
  });

  it('should update user and add email_verified to idToken', (done) => {
    nock('https://zap.example.com')
      .post('/hook-path', (body) => {
        const expectations = {
          appName: context.clientName,
          userAgent: context.request.userAgent,
          ip: context.request.ip,
          connection: context.connection,
          strategy: context.connectionStrategy,
          user_id: 'uid1'
        };

        expect(body).toEqual(expectations);
        return true;
      })
      .reply(200);

    rule({ user_id: 'uid1' }, context, (err) => {
      expect(err).toBeFalsy();
      done();
    });
  });
});
