'use strict';

const nock = require('nock');

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'parse';

describe(ruleName, () => {
  let context;
  let rule;

  beforeEach(() => {
    rule = loadRule(ruleName, { }, { request: require('request') });

    const request = new RequestBuilder().build();
    context = new ContextBuilder()
      .withRequest(request)
      .build();
  });

  describe('should throw error', () => {
    it('if login call fails', (done) => {
      nock('https://api.parse.com')
        .get('/1/login?username=uid1&password=PARSE_USER_MASTER_KEY')
        .replyWithError(new Error('testing error'));

      rule({ user_id: 'uid1' }, context, (err) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toEqual('testing error');
        done();
      });
    });

    it('if login call fails', (done) => {
      nock('https://api.parse.com')
        .get('/1/login?username=uid1&password=PARSE_USER_MASTER_KEY')
        .reply(400, 'bad request');

      rule({ user_id: 'uid1' }, context, (err) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toEqual('The login returned an unknown error. Status: 400 Body: bad request');
        done();
      });
    });

    it('if users call fails', (done) => {
      nock('https://api.parse.com')
        .get('/1/login?username=uid1&password=PARSE_USER_MASTER_KEY')
        .reply(404);

      nock('https://api.parse.com')
        .post('/1/users')
        .replyWithError(new Error('testing error'));

      rule({ user_id: 'uid1' }, context, (err) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toEqual('testing error');
        done();
      });
    });

    it('if users call fails', (done) => {
      nock('https://api.parse.com')
        .get('/1/login?username=uid1&password=PARSE_USER_MASTER_KEY')
        .reply(404);

      nock('https://api.parse.com')
        .post('/1/users')
        .reply(400, 'bad request');

      rule({ user_id: 'uid1' }, context, (err) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toEqual('The user provisioning returned an unknown error. Body: "bad request"');
        done();
      });
    });
  });

  describe('should get sessionToken', () => {
    it('using get login call', (done) => {
      const reqheaders = {
        'X-Parse-Application-Id': 'PLACE HERE YOUR PARSE APP ID',
        'X-Parse-REST-API-Key': 'PLACE HERE YOUR PARSE REST API KEY'
      };

      nock('https://api.parse.com', { reqheaders })
        .get('/1/login?username=uid1&password=PARSE_USER_MASTER_KEY')
        .reply(200, { sessionToken: 'sessionToken' });

      rule({ user_id: 'uid1' }, context, (err, u, c) => {
        expect(err).toBeFalsy();
        expect(c.idToken['https://example.com/parse_session_token']).toEqual('sessionToken');
        done();
      });
    });

    it('using post users call', (done) => {
      const reqheaders = {
        'X-Parse-Application-Id': 'PLACE HERE YOUR PARSE APP ID',
        'X-Parse-REST-API-Key': 'PLACE HERE YOUR PARSE REST API KEY'
      };

      nock('https://api.parse.com', { reqheaders })
        .get('/1/login?username=uid1&password=PARSE_USER_MASTER_KEY')
        .reply(404);

      nock('https://api.parse.com', { reqheaders })
        .post('/1/users', function(body) {
          expect(body.username).toEqual('uid1');
          expect(body.password).toEqual('PARSE_USER_MASTER_KEY');
          return true;
        })
        .reply(201, { sessionToken: 'sessionToken' });

      rule({ user_id: 'uid1' }, context, (err, u, c) => {
        expect(err).toBeFalsy();
        expect(c.idToken['https://example.com/parse_session_token']).toEqual('sessionToken');
        done();
      });
    });
  });
});
