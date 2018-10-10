'use strict';

const nock = require('nock');

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'socure-fraudscore';

describe(ruleName, () => {
  let context;
  let rule;

  const configuration = {
    SOCURE_KEY: 'YOUR_SOCURE_API_KEY'
  };

  const auth0 = {
    users: {
      updateAppMetadata: (id, metadata) => {
        if (id === 'broken') {
          return Promise.reject();
        }

        expect(id).toEqual('uid1');
        expect(metadata.socure_fraudscore).toEqual('fraudscore');
        expect(metadata.socure_confidence).toEqual('confidence');
        expect(metadata.socure_details).toEqual('details');

        return Promise.resolve();
      }
    }
  };

  beforeEach(() => {
    rule = loadRule(ruleName, { configuration, auth0 });

    const request = new RequestBuilder().build();
    context = new ContextBuilder()
      .withRequest(request)
      .build();
  });

  it('should get data from socure.com and add it to idToken', (done) => {
    nock('https://service.socure.com')
      .get('/api/1/EmailAuthScore?email=duck.t%40example.com&socurekey=YOUR_SOCURE_API_KEY&ipaddress=188.6.125.49')
      .reply(200, { status: 'Ok', data: { fraudscore: 'fraudscore', confidence: 'confidence', details: 'details' } });

    rule({ user_id: 'uid1', email: 'duck.t@example.com' }, context, (err, u, c) => {
      expect(err).toBeFalsy();
      expect(c.idToken['https://example.com/socure_fraudscore']).toEqual('fraudscore');
      expect(c.idToken['https://example.com/socure_confidence']).toEqual('confidence');
      expect(c.idToken['https://example.com/socure_details']).toEqual('details');
      done();
    });
  });

  it('should do nothing if socure_fraudscore is already in metadata', (done) => {
    rule({ app_metadata: { socure_fraudscore: true } }, context, (err, u, c) => {
      expect(err).toBeFalsy();
      expect(c).toEqual(context);
      done();
    });
  });

  it('should do nothing if there is no user.email', (done) => {
    rule({}, context, (err, u, c) => {
      expect(err).toBeFalsy();
      expect(c).toEqual(context);
      done();
    });
  });

  it('should do nothing if request fails', (done) => {
    nock('https://service.socure.com')
      .get('/api/1/EmailAuthScore?email=duck.t%40example.com&socurekey=YOUR_SOCURE_API_KEY&ipaddress=188.6.125.49')
      .replyWithError(new Error('test error'));

    rule({}, context, (err, u, c) => {
      expect(err).toBeFalsy();
      expect(c).toEqual(context);
      done();
    });
  });

  it('should do nothing if metadata update fails', (done) => {
    nock('https://service.socure.com')
      .get('/api/1/EmailAuthScore?email=duck.t%40example.com&socurekey=YOUR_SOCURE_API_KEY&ipaddress=188.6.125.49')
      .reply(200, { status: 200, data: {} });

    rule({ user_id: 'broken' }, context, (err, u, c) => {
      expect(err).toBeFalsy();
      expect(c).toEqual(context);
      done();
    });
  });
});
