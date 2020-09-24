'use strict';

const nock = require('nock');

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'mailgun';

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

  const configuration = {
    MAILGUN_API_KEY: '{YOUR MAILGUN KEY}'
  };

  beforeEach(() => {
    rule = loadRule(ruleName, { auth0, configuration });

    const request = new RequestBuilder().build();
    context = new ContextBuilder()
      .withRequest(request)
      .build();

    user.app_metadata = {};
  });

  describe('should sign up user', () => {
    it('and send email', (done) => {
      nock('https://api.mailgun.net')
        .post('/v3/%7BYOUR%20MAILGUN%20ACCOUNT%7D/messages', function(body) {
          expect(body.to).toEqual('admin@example.com');
          expect(body.subject).toEqual('NEW SIGNUP');
          expect(body.from).toEqual('admin@example.com');
          expect(body.text).toEqual('We have got a new sign up from: duck.t@example.com.');

          return true;
        })
        .basicAuth({
          user: 'api',
          pass: '{YOUR MAILGUN KEY}'
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
      nock('https://api.mailgun.net')
        .post('/v3/%7BYOUR%20MAILGUN%20ACCOUNT%7D/messages', function() {
          return true;
        })
        .replyWithError(new Error('testing error'));

      rule(user, context, (err) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toEqual('testing error');
        done();
      });
    });

    it('if mailer call fails', (done) => {
      nock('https://api.mailgun.net')
        .post('/v3/%7BYOUR%20MAILGUN%20ACCOUNT%7D/messages', function() {
          return true;
        })
        .reply(400);

      rule(user, context, (err) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toEqual('Invalid operation');
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
