'use strict';

const nock = require('nock');

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'sends-sms-with-twilio';

describe(ruleName, () => {
  let context;
  let rule;
  const auth0 = {
    users: {
      updateAppMetadata: function(id, metadata) {
        expect(typeof metadata.lastDeviceFingerPrint).toEqual('string');

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

  describe('should update metadata', () => {
    beforeEach(() => {
      const request = new RequestBuilder().build();
      context = new ContextBuilder()
        .withRequest(request)
        .build();
    });

    it('and do nothing if user has no phone', (done) => {
      const user = {
        user_id: 'uid1',
        name: 'Terrified Duck',
        email: 'duck.t@example.com'
      };

      rule(user, context, (err, u, c) => {
        expect(err).toBeFalsy();
        expect(u.app_metadata.lastDeviceFingerPrint).toEqual('b9df8809b7a926686516f65654d8892853cfe0ca');
        expect(c).toEqual(context);

        done();
      });
    });

    it('and do nothing if there is no previous fingerprint', (done) => {
      const user = {
        user_id: 'uid1',
        name: 'Terrified Duck',
        email: 'duck.t@example.com',
        phone: true
      };

      rule(user, context, (err, u, c) => {
        expect(err).toBeFalsy();
        expect(u.app_metadata.lastDeviceFingerPrint).toEqual('b9df8809b7a926686516f65654d8892853cfe0ca');
        expect(c).toEqual(context);

        done();
      });
    });

    it('and return error if metadata update fails', (done) => {
      rule({ user_id: 'broken' }, context, (err) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toEqual('test update error');

        done();
      });
    });

    it('and notify user', (done) => {
      const user = {
        user_id: 'uid1',
        name: 'Terrified Duck',
        email: 'duck.t@example.com',
        phone: '555',
        app_metadata: {
          lastDeviceFingerPrint: 'what?'
        }
      };

      nock('https://api.twilio.com')
        .post('/2010-04-01/Accounts/YOUR_TWILIO_ACCOUNT/Messages.json', function(body) {
          expect(body.body).toEqual('You\'ve logged in from a different device or location.');
          expect(body.to).toEqual('555');
          expect(body.from).toEqual('+18668888888');
          return true;
        })
        .basicAuth({
          user: 'YOUR_TWILIO_ACCOUNT',
          pass: 'YOUR_TWILIO_AUTH_TOKEN'
        })
        .reply(201);

      rule(user, context, (err, u, c) => {
        expect(err).toBeFalsy();
        expect(u.app_metadata.lastDeviceFingerPrint).toEqual('b9df8809b7a926686516f65654d8892853cfe0ca');
        expect(c).toEqual(context);

        done();
      });
    });

    it('and return error if notify fails', (done) => {
      const user = {
        user_id: 'uid1',
        name: 'Terrified Duck',
        email: 'duck.t@example.com',
        phone: '555',
        app_metadata: {
          lastDeviceFingerPrint: 'what?'
        }
      };

      nock('https://api.twilio.com')
        .post('/2010-04-01/Accounts/YOUR_TWILIO_ACCOUNT/Messages.json', function() {
          return true;
        })
        .reply(400);

      rule(user, context, (err) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toEqual('400');

        done();
      });
    });

    it('and return error if notify fails', (done) => {
      const user = {
        user_id: 'uid1',
        name: 'Terrified Duck',
        email: 'duck.t@example.com',
        phone: '555',
        app_metadata: {
          lastDeviceFingerPrint: 'what?'
        }
      };

      nock('https://api.twilio.com')
        .post('/2010-04-01/Accounts/YOUR_TWILIO_ACCOUNT/Messages.json', function() {
          return true;
        })
        .replyWithError(new Error('test notify error'));

      rule(user, context, (err) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toEqual('test notify error');

        done();
      });
    });
  });
});
