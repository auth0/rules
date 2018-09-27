'use strict';

const nock = require('nock');

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'mandrill';

describe(ruleName, () => {
  let context;
  let rule;
  const user = {
    user_id: 'uid1',
    email: 'duck.t@example.com',
    name: 'Terrified Duck',
    app_metadata: {}
  };

  const auth0 = {
    users: {
      updateAppMetadata: (id, metadata) => {
        expect(id).toEqual('uid1');
        expect(metadata.signedUp).toEqual(true);
        return Promise.resolve();
      }
    }
  };

  beforeEach(() => {
    rule = loadRule(ruleName, { auth0 }, { request: require('request') });

    const request = new RequestBuilder().build();
    context = new ContextBuilder()
      .withRequest(request)
      .build();

    user.app_metadata = {};
  });

  describe('should sign up user', () => {
    it('and send email', (done) => {
      nock('https://mandrillapp.com')
        .post('/api/1.0/messages/send.json', function(body) {
          expect(body.key).toEqual('MANDRILL_API_KEY');
          expect(body.message.subject).toEqual('User Terrified Duck signed up to Default App');
          expect(body.message.text).toEqual('Sent from an Auth0 rule');
          expect(body.message.from_email).toEqual('SENDER_EMAIL@example.com');
          expect(body.message.from_name).toEqual('Auth0 Rule');
          expect(body.message.to[0].email).toEqual('DESTINATION_EMAIL@example.com');

          return true;
        })
        .reply(200);

      rule(user, context, (err, u, c) => {
        expect(err).toBeFalsy();
        done();
      });
    });
  });

  describe('should throw error', () => {
    it('if mailer call fails', (done) => {
      nock('https://mandrillapp.com')
        .post('/api/1.0/messages/send.json', function() {
          return true;
        })
        .replyWithError(new Error('testing error'));

      rule(user, context, (err) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toEqual('testing error');
        done();
      });
    });
  });

  describe('should do nothing', () => {
    it('if user is already signed up', (done) => {
      rule({ app_metadata: { signedUp: true } }, context, (err) => {
        expect(err).toBeFalsy();
        done();
      });
    });
  });
});
