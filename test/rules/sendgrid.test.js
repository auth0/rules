'use strict';

const nock = require('nock');

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'sendgrid';

describe(ruleName, () => {
  let context;
  let rule;
  const auth0 = {
    users: {
      updateAppMetadata: function(id, metadata) {
        expect(metadata.signedUp).toEqual(true);

        if (id === 'broken') {
          return Promise.reject(new Error('test update error'));
        }

        expect(id).toEqual('uid1');

        return Promise.resolve();
      }
    }
  };

  beforeEach(() => {
    rule = loadRule(ruleName, { auth0 });
  });

  describe('should do nothing', () => {
    beforeEach(() => {
      const request = new RequestBuilder().build();
      context = new ContextBuilder()
        .withRequest(request)
        .build();
    });

    it('if user is already signedUp', (done) => {
      rule({ app_metadata: { signedUp: true } }, context, (err, u, c) => {
        expect(err).toBeFalsy();
        expect(c).toEqual(context);

        done();
      });
    });
  });

  describe('should post to sendgrid', () => {
    beforeEach(() => {
      const request = new RequestBuilder().build();
      context = new ContextBuilder()
        .withRequest(request)
        .build();

      context.stats.loginsCount = 1;
    });

    it('and update metadata', (done) => {
      const user = {
        user_id: 'uid1',
        name: 'Terrified Duck',
        email: 'duck.t@example.com'
      };

      nock('https://api.sendgrid.com', { reqheaders: { Authorization: 'Bearer ...'} })
        .post('/api/mail.send.json', function(body) {
          const expectations = {
            to: 'admin@example.com',
            subject: 'NEW SIGNUP',
            from: 'admin@example.com',
            text: 'We have got a new sign up from: ' + user.email + '.'
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

    it('and return error if call fails', (done) => {
      nock('https://api.sendgrid.com', { reqheaders: { Authorization: 'Bearer ...'} })
        .post('/api/mail.send.json', function() {
          return true;
        })
        .reply(400);

      rule({}, context, (err) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toEqual('Invalid operation');

        done();
      });
    });

    it('and return error if call fails', (done) => {
      nock('https://api.sendgrid.com', { reqheaders: { Authorization: 'Bearer ...'} })
        .post('/api/mail.send.json', function() {
          return true;
        })
        .replyWithError(new Error('test 400 error'));

      rule({}, context, (err) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toEqual('test 400 error');

        done();
      });
    });

    it('and return error if metadata update fails', (done) => {
      nock('https://api.sendgrid.com', { reqheaders: { Authorization: 'Bearer ...'} })
        .post('/api/mail.send.json', function() {
          return true;
        })
        .reply(200);

      rule({ user_id: 'broken' }, context, (err) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toEqual('test update error');

        done();
      });
    });
  });
});
