'use strict';

const nock = require('nock');

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'requestbin';

describe(ruleName, () => {
  let context;
  let rule;

  beforeEach(() => {
    rule = loadRule(ruleName);

    const request = new RequestBuilder().build();
    context = new ContextBuilder()
      .withRequest(request)
      .build();
  });

  it('should return error if call fails', (done) => {
    nock('http://requestbin.fullcontact.com')
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

    nock('http://requestbin.fullcontact.com')
      .post('/YourBinUrl', function(body) {
        expect(body.user).toEqual(user);
        expect(body.context).toEqual(context);
        return true;
      })
      .reply(200);

    rule(user, context, (err) => {
      expect(err).toBeFalsy();

      done();
    });
  });
});
