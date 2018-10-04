'use strict';

const nock = require('nock');

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'splunk-HEC-track-event';

describe(ruleName, () => {
  let context;
  let rule;

  const auth0 = {
    users: {
      updateAppMetadata: (id, metadata) => {
        if (id === 'broken') {
          return Promise.reject(new Error('metadata update error'));
        }

        expect(id).toEqual('uid1');
        expect(metadata.signedUp).toEqual(true);

        return Promise.resolve();
      }
    }
  };

  beforeEach(() => {
    rule = loadRule(ruleName, { auth0 });

    const request = new RequestBuilder().build();
    context = new ContextBuilder()
      .withRequest(request)
      .build();
  });

  it('should post data to Splunk and update user metadata', (done) => {
    nock('https://http-inputs-mysplunkcloud.example.com:443', { reqheaders: { Authorization: 'Splunk YOUR_SPLUNK_HEC_TOKEN'} })
      .post('/services/collector', (body) => {
        const expectetions = {
          event: {
            message: 'SignUp',
            application: context.clientName,
            clientIP: context.request.ip,
            protocol: context.protocol,
            userName: 'Terrified Duck',
            userId: 'uid1'
          },
          source: 'auth0',
          sourcetype: 'auth0_activity'
        };
        expect(body).toEqual(expectetions);

        return true;
      })
      .reply(200);

    rule({ user_id: 'uid1', name: 'Terrified Duck' }, context, (err, u) => {
      expect(err).toBeFalsy();
      expect(u.app_metadata.signedUp).toEqual(true);
      done();
    });
  });

  it('should return error if Splunk call fails', (done) => {
    nock('https://http-inputs-mysplunkcloud.example.com:443')
      .post('/services/collector', () => true)
      .replyWithError(new Error('test error'));

    rule({ }, context, (err) => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toEqual('test error');
      done();
    });
  });


  it('should return error if metadata update fails', (done) => {
    nock('https://http-inputs-mysplunkcloud.example.com:443')
      .post('/services/collector', () => true)
      .reply(200);

    rule({ user_id: 'broken' }, context, (err) => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toEqual('metadata update error');
      done();
    });
  });
});
