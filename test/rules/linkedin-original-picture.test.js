'use strict';

const nock = require('nock');

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'linkedin-original-picture';

describe(ruleName, () => {
  let context;
  let rule;
  const user = {
    user_id: 'uid1',
    email: 'duck.t@example.com',
    name: 'Terrified Duck',
    identities: [
      {
        access_token: 'access_token'
      }
    ]
  };

  beforeEach(() => {
    rule = loadRule(ruleName, { request: require('request') });
  });

  describe('should do nothing', () => {
    beforeEach(() => {
      const request = new RequestBuilder().build();
      context = new ContextBuilder()
        .withRequest(request)
        .build();
    });

    it('if provider isn`t linkedin', (done) => {
      rule({}, context, (err) => {
        expect(err).toBeFalsy();
        done();
      });
    });
  });

  describe('should add linkedin picture', () => {
    beforeEach(() => {
      const request = new RequestBuilder().build();
      context = new ContextBuilder()
        .withRequest(request)
        .build();
      context.connection = 'linkedin';
    });

    it('to the context.idToken', (done) => {
      nock('https://api.linkedin.com', { reqheaders: { 'authorization': 'Bearer access_token' } })
        .get('/v1/people/~/picture-urls::(original)?format=json')
        .reply(200, { values: [ 'picture-url' ] });

      rule(user, context, (err, u, c) => {
        expect(c.idToken.picture).toEqual('picture-url');
        done();
      });
    });
  });
});
