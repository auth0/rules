'use strict';

const nock = require('nock');
const _ = require('lodash');

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'requestbin';

describe(ruleName, () => {
  let context;
  let rule;
  let globals;

  beforeEach(() => {
    globals = {
      _: _
    };
    rule = loadRule(ruleName, globals);

    const request = new RequestBuilder().build();
    context = new ContextBuilder()
      .withRequest(request)
      .build();
  });

  it('should return error if call fails', (done) => {
    nock('https://requestbin.fullcontact.com')
      .post('/YourBinUrl', function() {
        return true;
      })
      .replyWithError(new Error('test error'));

    rule({}, context, (err) => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toEqual('test error');

      done();
    });
  });

  it('should post user data', (done) => {
    const user = {
      id: 'uid1',
      name: 'Terrified Duck',
      email: 'duck.t@example.com'
    };

    const user_whitelist = ['user_id', 'email', 'email_verified'];
    const user_filtered  = _.pick(user, user_whitelist);

    const context_whitelist = ['clientID', 'connection', 'stats'];
    const context_filtered  = _.pick(context, context_whitelist);

    nock('https://requestbin.fullcontact.com')
      .post('/YourBinUrl', function(body) {
        expect(body.user).toEqual(user_filtered);
        expect(body.context).toEqual(context_filtered);
        return true;
      })
      .reply(200);

    rule(user, context, (err) => {
      expect(err).toBeFalsy();

      done();
    });
  });
});
