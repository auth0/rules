'use strict';

const nock = require('nock');

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'send-events-segmentio';

describe(ruleName, () => {
  let context;
  let rule;
  const user = {
    user_id: 'uid1',
    name: 'Terrified Duck',
    email: 'duck.t@example.com'
  };

  beforeEach(() => {
    rule = loadRule(ruleName);
  });

  describe('should do nothing', () => {
    beforeEach(() => {
      const request = new RequestBuilder().build();
      context = new ContextBuilder()
        .withRequest(request)
        .build();
      context.protocol = 'delegation';
    });

    it('if context.protocol is "delegation"', (done) => {
      rule({}, context, (err, u, c) => {
        expect(err).toBeFalsy();
        expect(c).toEqual(context);

        done();
      });
    });
  });

  describe('should post userdata to segment', () => {
    beforeEach(() => {
      const request = new RequestBuilder().build();
      context = new ContextBuilder()
        .withRequest(request)
        .build();

      context.stats.loginsCount = 1;
    });

    it('as "Signed up" if it`s first login', (done) => {
      nock('https://SEGMENTIO_WRITE_KEY@api.segment.io')
        .post('/v1/track', function(body) {
          const expectations = {
            userId: user.user_id,
            event: 'Signed up',
            properties: {
              application: context.clientName
            },
            context: {
              ip : context.request.ip,
              userAgent : context.request.userAgent
            }
          };
          expect(body).toEqual(expectations);

          return true;
        })
        .reply(200);

      rule(user, context, (err, u, c) => {
        expect(err).toBeFalsy();
        expect(c).toEqual(context);

        done();
      });
    });

    it('as "Logged in" if login count > 1', (done) => {
      nock('https://SEGMENTIO_WRITE_KEY@api.segment.io')
        .post('/v1/track', function(body) {
          const expectations = {
            userId: user.user_id,
            event: 'Logged in',
            properties: {
              application: context.clientName
            },
            context: {
              ip : context.request.ip,
              userAgent : context.request.userAgent
            }
          };
          expect(body).toEqual(expectations);

          return true;
        })
        .reply(200);

      context.stats.loginsCount = 2;
      rule(user, context, (err, u, c) => {
        expect(err).toBeFalsy();
        expect(c).toEqual(context);

        done();
      });
    });
  });
});
