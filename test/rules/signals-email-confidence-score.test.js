'use strict';

const nock = require('nock');

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');
const UserBuilder = require('../utils/userBuilder');

const ruleName = 'signals-email-confidence-score';

const responseJson = {
  'response':{
     'email':{
        'blacklist':[
           'TEST-EMAIL'
        ],
        'score':-1
     },
     'domain':{
        'blacklist':[
           'TEST-DOMAIN'
        ],
        'blacklist_mx':[

        ],
        'blacklist_ns':[

        ],
        'mx':[
           'mx.test.com'
        ],
        'ns':[
           'ns.test.com'
        ],
        'score':-1
     },
     'disposable':{
        'is_disposable':false,
        'score':0
     },
     'freemail':{
        'is_freemail':true,
        'score':0
     },
     'ip':{
        'blacklist':[
           'TEST-IP'
        ],
        'is_quarantined':false,
        'address':'1.2.3.4',
        'score':-1
     },
     'source_ip':{
        'blacklist':[],
        'is_quarantined':false,
        'address':'88.3.83.46',
        'score':0
     },
     'address':{
        'is_role':false,
        'is_well_formed':true,
        'score':0
     },
     'smtp':{
        'exist_mx':true,
        'exist_address':true,
        'exist_catchall':false,
        'graylisted':false,
        'timedout':false,
        'score':0
     },
     'score':-3,
     'email_address':'test@example.com'
  },
  'type':'bademail'
};

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

  it('should get email reputation score from Signals and add it to idToken and user metadata', (done) => {
    nock('https://signals.api.auth0.com', {
      reqheaders: {
        'content-type': 'application/json'
      },    
    })
      .get('/bademail/superuser@users.com?timeout=0&token=YOUR_AUTH0SIGNALS_API_KEY')
      .reply(200, responseJson);

    rule(user, context, (err, u, c) => {
      expect(err).toBeFalsy();
      expect(c.idToken['https://example.com/email']['email_address']).toEqual(responseJson.response.email_address);
      expect(c.idToken['https://example.com/email']['score']).toEqual(responseJson.response.score);
      expect(c.idToken['https://example.com/email']['email']['blacklist']).toEqual(responseJson.response.email.blacklist);
      expect(c.idToken['https://example.com/email']['email']['score']).toEqual(responseJson.response.email.score);
      expect(c.idToken['https://example.com/email']['domain']['blacklist']).toEqual(responseJson.response.domain.blacklist);
      expect(c.idToken['https://example.com/email']['domain']['blacklist_mx']).toEqual(responseJson.response.domain.blacklist_mx);
      expect(c.idToken['https://example.com/email']['domain']['blacklist_ns']).toEqual(responseJson.response.domain.blacklist_ns);
      expect(c.idToken['https://example.com/email']['domain']['score']).toEqual(responseJson.response.domain.score);
      expect(c.idToken['https://example.com/email']['ip']['blacklist']).toEqual(responseJson.response.ip.blacklist);
      expect(c.idToken['https://example.com/email']['ip']['score']).toEqual(responseJson.response.ip.score);
      expect(c.idToken['https://example.com/email']['disposable']['is_disposable']).toEqual(responseJson.response.disposable.is_disposable);
      expect(c.idToken['https://example.com/email']['freemail']['is_freemail']).toEqual(responseJson.response.freemail.is_freemail);
      expect(c.idToken['https://example.com/email']['smtp']['score']).toEqual(responseJson.response.smtp.score);
      expect(c.idToken['https://example.com/email']['address']['score']).toEqual(responseJson.response.address.score);

      expect(u.user_metadata.email['email_address']).toEqual(responseJson.response.email_address);
      expect(u.user_metadata.email['score']).toEqual(responseJson.response.score);
      expect(u.user_metadata.email['email']['blacklist']).toEqual(responseJson.response.email.blacklist);
      expect(u.user_metadata.email['email']['score']).toEqual(responseJson.response.email.score);
      expect(u.user_metadata.email['domain']['blacklist']).toEqual(responseJson.response.domain.blacklist);
      expect(u.user_metadata.email['domain']['blacklist_mx']).toEqual(responseJson.response.domain.blacklist_mx);
      expect(u.user_metadata.email['domain']['blacklist_ns']).toEqual(responseJson.response.domain.blacklist_ns);
      expect(u.user_metadata.email['domain']['score']).toEqual(responseJson.response.domain.score);
      expect(u.user_metadata.email['ip']['blacklist']).toEqual(responseJson.response.ip.blacklist);
      expect(u.user_metadata.email['ip']['score']).toEqual(responseJson.response.ip.score);
      expect(u.user_metadata.email['disposable']['is_disposable']).toEqual(responseJson.response.disposable.is_disposable);
      expect(u.user_metadata.email['freemail']['is_freemail']).toEqual(responseJson.response.freemail.is_freemail);
      expect(u.user_metadata.email['smtp']['score']).toEqual(responseJson.response.smtp.score);
      expect(u.user_metadata.email['address']['score']).toEqual(responseJson.response.address.score);

      done();
    });
  });

  it('should get empty email reputation data from Signals when returning 429', (done) => {
    nock('https://signals.api.auth0.com', {
      reqheaders: {
        'content-type': 'application/json'
      },    
    })
      .get('/bademail/superuser@users.com?timeout=0&token=YOUR_AUTH0SIGNALS_API_KEY')
      .reply(429);
    rule(user, context, (err, u, c) => {
      expect(err).toBeFalsy();
      expect(c).toEqual(context);
      expect(c.idToken['https://example.com/email']).toEqual(undefined);
      done();
    });
  });

  it('should do nothing if request fails', (done) => {
    nock('https://signals.api.auth0.com', {
      reqheaders: {
        'content-type': 'application/json',
      },    
    })
      .get('/bademail/superuser@users.com?timeout=0&token=YOUR_AUTH0SIGNALS_API_KEY')
      .replyWithError(new Error('test error'));

    rule({}, context, (err, u, c) => {
      expect(err).toBeFalsy();
      expect(c).toEqual(context);
      expect(c.idToken['https://example.com/email']).toEqual(undefined);
      done();
    });
  });
});
