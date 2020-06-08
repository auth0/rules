'use strict';

const nock = require('nock');

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');
const UserBuilder = require('../utils/userBuilder');

const ruleName = 'signals-ip-blacklisted';

describe(ruleName, () => {
  let context;
  let rule;
  let rule_clean;
  let user;

  const configuration = {
    AUTH0SIGNALS_API_KEY: 'YOUR_AUTH0SIGNALS_API_KEY'
  };

  const auth0 = {
    users: {
      updateUserMetadata: (id, metadata) => {
        if (id === 'broken') {
          return Promise.reject();
        }
        
        expect(id).toEqual('12345');
        expect(metadata.source_ip.ip).toEqual('188.6.125.49');
        return Promise.resolve();
      }
    }
  };

  beforeEach(() => {
    rule = loadRule(ruleName, { configuration, auth0 });
    rule_clean = loadRule(ruleName, { configuration });

    const request = new RequestBuilder().build();
    context = new ContextBuilder()
      .withRequest(request)
      .build();
    user = new UserBuilder()
      .build();
    });

  it('should get data found from Signals and add it to idToken and user metadata', (done) => {
    nock('https://signals.api.auth0.com', {
      reqheaders: {
        'content-type': 'application/json'
      },    
    })
      .get('/badip/188.6.125.49?token=YOUR_AUTH0SIGNALS_API_KEY')
      .reply(200, {response: ['STOPFORUMSPAM-1']});

    rule(user, context, (err, u, c) => {
      expect(err).toBeFalsy();
      expect(c.idToken['https://example.com/blacklists']).toEqual(['STOPFORUMSPAM-1']);
      expect(u.user_metadata.source_ip.blacklists).toEqual(['STOPFORUMSPAM-1']);
      expect(u.user_metadata.source_ip.ip).toEqual('188.6.125.49');
      done();
    });
  });

  it('should get data not found from Signals and add it to idToken and user metadata', (done) => {
    nock('https://signals.api.auth0.com', {
      reqheaders: {
        'content-type': 'application/json'
      },    
    })
      .get('/badip/188.6.125.49?token=YOUR_AUTH0SIGNALS_API_KEY')
      .reply(404);
    rule(user, context, (err, u, c) => {
      expect(err).toBeFalsy();
      expect(c.idToken['https://example.com/blacklists']).toEqual([]);
      expect(u.user_metadata.source_ip.blacklists).toEqual([]);
      expect(u.user_metadata.source_ip.ip).toEqual('188.6.125.49');
      done();
    });
  });

  it('should do nothing if request fails', (done) => {
    nock('https://signals.api.auth0.com', {
      reqheaders: {
        'content-type': 'application/json',
      },    
    })
      .get('/badip/188.6.125.49?token=YOUR_AUTH0SIGNALS_API_KEY')
      .replyWithError(new Error('test error'));

    rule({}, context, (err, u, c) => {
      expect(err).toBeFalsy();
      expect(c).toEqual(context);
      done();
    });
  });

  it('should get data not found from Signals when returning 429', (done) => {
    nock('https://signals.api.auth0.com', {
      reqheaders: {
        'content-type': 'application/json'
      },    
    })
      .get('/badip/188.6.125.49?token=YOUR_AUTH0SIGNALS_API_KEY')
      .reply(429);
    rule(user, context, (err, u, c) => {
      expect(err).toBeFalsy();
      expect(c).toEqual(context);
      expect(u).toEqual(user);
      expect(c.idToken['https://example.com/blacklists']).toEqual(undefined);
      done();
    });
  });

  it('should get data not found from Signals when returning 400', (done) => {
    nock('https://signals.api.auth0.com', {
      reqheaders: {
        'content-type': 'application/json'
      },    
    })
      .get('/badip/188.6.125.49?token=YOUR_AUTH0SIGNALS_API_KEY')
      .reply(400);
    rule(user, context, (err, u, c) => {
      expect(err).toBeFalsy();
      expect(c).toEqual(context);
      expect(u).toEqual(user);
      expect(c.idToken['https://example.com/blacklists']).toEqual(undefined);
      done();
    });
  });

});
