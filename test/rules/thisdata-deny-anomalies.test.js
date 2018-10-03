'use strict';

const nock = require('nock');

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'thisdata-deny-anomalies';

describe(ruleName, () => {
  let context;
  let rule;

  const configuration = {
    THISDATA_API_KEY: 'THISDATA_API_KEY'
  };

  beforeEach(() => {
    rule = loadRule(ruleName, { configuration, UnauthorizedError: Error });

    const request = new RequestBuilder().build();
    context = new ContextBuilder()
      .withRequest(request)
      .build();
  });

  it('should block login in case of anomaly', (done) => {
    const user = {
      user_id: 'uid1',
      email: 'duck.t@example.com',
      name: 'Terrified Duck'
    };

    nock('https://api.thisdata.com', { reqheaders: { 'User-Agent': 'thisdata-auth0' } })
      .post('/v1/verify?api_key=THISDATA_API_KEY', (body) => {
        const expectetions = {
          ip: context.request.ip,
          user_agent: context.request.userAgent,
          user: {
            id: user.user_id,
            name: user.name,
            email: user.email
          }
        };
        expect(body).toEqual(expectetions);
        return true;
      })
      .reply(200, { score: 1 });

    rule(user, context, (err) => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toEqual('Login anomaly detected by ThisData. Risk: 1');

      done();
    });
  });

  it('should allow to login if there is no anomaly', (done) => {
    const user = {
      user_id: 'uid1',
      email: 'duck.t@example.com',
      name: 'Terrified Duck'
    };

    nock('https://api.thisdata.com', { reqheaders: { 'User-Agent': 'thisdata-auth0' } })
      .post('/v1/verify?api_key=THISDATA_API_KEY', (body) => {
        const expectetions = {
          ip: context.request.ip,
          user_agent: context.request.userAgent,
          user: {
            id: user.user_id,
            name: user.name,
            email: user.email
          }
        };
        expect(body).toEqual(expectetions);
        return true;
      })
      .reply(200, { score: 0.5 });

    rule(user, context, (err, u) => {
      expect(err).toBeFalsy();
      expect(u).toEqual(user);

      done();
    });
  });

  it('should allow to login if there is no anomaly', (done) => {
    nock('https://api.thisdata.com')
      .post('/v1/verify?api_key=THISDATA_API_KEY', () => true)
      .replyWithError(new Error('test error'));

    rule({}, context, (err, u) => {
      expect(err).toBeFalsy();
      expect(u).toEqual({});

      done();
    });
  });
});
