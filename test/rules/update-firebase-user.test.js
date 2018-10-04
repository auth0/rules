'use strict';

const nock = require('nock');

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'update-firebase-user';

describe(ruleName, () => {
  let context;
  let rule;
  const user = {
    user_id: 'uid1',
    email: 'duck.t@example.com',
    name: 'Terrified Duck',
    nickname: 'T-Duck',
    picture: 'http://duckpic.com/someduck.pic'
  };

  const configuration = {
    FIREBASE_URL: 'https://example.com',
    FIREBASE_SECRET: 'FIREBASE_SECRET'
  };

  beforeEach(() => {
    rule = loadRule(ruleName, { configuration });

    const request = new RequestBuilder().build();
    context = new ContextBuilder()
      .withRequest(request)
      .build();
  });

  it('should put userdata to firebase', (done) => {
    nock('https://example.com')
      .intercept('/users/dWlkMQ==.json?auth=FIREBASE_SECRET', 'PUT', (body) => {
        const expectations = {
          identity: {
            user_id: user.user_id,
            email: user.email,
            name: user.name,
            nickname: user.nickname,
            picture: user.picture
          }
        };
        expect(body).toEqual(expectations);
        return true;
      })
      .reply(200);

    rule(user, context, (err, u) => {
      expect(err).toBeFalsy();
      expect(u).toEqual(user);
      done();
    });
  });

  it('should return error if firebase call fails', (done) => {
    nock('https://example.com')
      .intercept('/users/dWlkMQ==.json?auth=FIREBASE_SECRET', 'PUT')
      .replyWithError(new Error('test error'));

    rule(user, context, (err) => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toEqual('test error');
      done();
    });
  });
});
