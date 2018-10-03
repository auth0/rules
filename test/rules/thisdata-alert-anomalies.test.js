'use strict';

const nock = require('nock');

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'thisdata-alert-anomalies';

describe(ruleName, () => {
  let context;
  let rule;

  const configuration = {
    THISDATA_API_KEY: 'THISDATA_API_KEY'
  };

  beforeEach(() => {
    rule = loadRule(ruleName, { configuration });

    const request = new RequestBuilder().build();
    context = new ContextBuilder()
      .withRequest(request)
      .build();
  });

  it('should post data to thisdata', (done) => {
    const user = {
      user_id: 'uid1',
      email: 'duck.t@example.com',
      name: 'Terrified Duck'
    };

    nock('https://api.thisdata.com', { reqheaders: { 'User-Agent': 'thisdata-auth0' } })
      .post('/v1/events?api_key=THISDATA_API_KEY', (body) => {
        const expectetions = {
          verb: 'log-in',
          ip: context.request.ip,
          user_agent: context.request.userAgent,
          user: {
            id: user.user_id,
            name: user.name,
            email: user.email
          }
        };
        expect(body).toEqual(expectetions);
        done();
        return true;
      })
      .reply(200);

    rule(user, context, (err) => {
      expect(err).toBeFalsy();
    });
  });
});
