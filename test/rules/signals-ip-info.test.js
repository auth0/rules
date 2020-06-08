'use strict';

const nock = require('nock');

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');
const UserBuilder = require('../utils/userBuilder');

const ruleName = 'signals-ip-info';

const responseJson = {
  'ip':{
     'address':'188.6.125.49',
     'hostname':'',
     'country':'HU',
     'country_names':{
     },
     'country_geoname_id':719819,
     'continent':'EU',
     'continent_names':{
     },
     'continent_geoname_id':6255148,
     'latitude':0,
     'longitude':0,
     'time_zone':'Europe/Budapest',
     'region':'Budapest',
     'region_names':{
     },
     'region_geoname_id':3054638,
     'city':'Budapest',
     'city_names':{
     },
     'city_geoname_id':3054643,
     'accuracy_radius':20,
     'postal':'',
     'as':{
        'name':'Magyar Telekom plc.',
        'country':'HU',
        'networks':[
        ],
        'asn':'5483'
     }
  }
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

  it('should get geo data from Signals and add it to idToken and user metadata', (done) => {
    nock('https://signals.api.auth0.com', {
      reqheaders: {
        'content-type': 'application/json'
      },    
    })
      .get('/geoip/188.6.125.49?token=YOUR_AUTH0SIGNALS_API_KEY')
      .reply(200, responseJson);

    rule(user, context, (err, u, c) => {
      expect(err).toBeFalsy();
      expect(c.idToken['https://example.com/country_code']).toEqual(responseJson.ip.country);
      expect(c.idToken['https://example.com/continent_code']).toEqual(responseJson.ip.continent);
      expect(c.idToken['https://example.com/asn']).toEqual(responseJson.ip.as.asn);
      expect(c.idToken['https://example.com/asn_name']).toEqual(responseJson.ip.as.name);
      expect(u.user_metadata.source_ip.country_code).toEqual(responseJson.ip.country);
      expect(u.user_metadata.source_ip.continent_code).toEqual(responseJson.ip.continent);
      expect(u.user_metadata.source_ip.asn).toEqual(responseJson.ip.as.asn);
      expect(u.user_metadata.source_ip.asn_name).toEqual(responseJson.ip.as.name);
      done();
    });
  });

  it('should get empty geo data from Signals and add it to idToken and user metadata', (done) => {
    nock('https://signals.api.auth0.com', {
      reqheaders: {
        'content-type': 'application/json'
      },    
    })
      .get('/geoip/188.6.125.49?token=YOUR_AUTH0SIGNALS_API_KEY')
      .reply(200, {ip:{}});
    rule(user, context, (err, u, c) => {
      expect(err).toBeFalsy();
      expect(c.idToken['https://example.com/country_code']).toEqual('');
      expect(c.idToken['https://example.com/continent_code']).toEqual('');
      expect(c.idToken['https://example.com/asn']).toEqual('');
      expect(c.idToken['https://example.com/asn_name']).toEqual('');
      expect(u.user_metadata.source_ip.country_code).toEqual('');
      expect(u.user_metadata.source_ip.continent_code).toEqual('');
      expect(u.user_metadata.source_ip.asn).toEqual('');
      expect(u.user_metadata.source_ip.asn_name).toEqual('');
      done();
    });
  });

  it('should do nothing if request fails', (done) => {
    nock('https://signals.api.auth0.com', {
      reqheaders: {
        'content-type': 'application/json',
      },    
    })
      .get('/geoip/188.6.125.49?token=YOUR_AUTH0SIGNALS_API_KEY')
      .replyWithError(new Error('test error'));

    rule({}, context, (err, u, c) => {
      expect(err).toBeFalsy();
      expect(c).toEqual(context);
      done();
    });
  });

  it('should get empty empty geo data from Signals when returning 429', (done) => {
    nock('https://signals.api.auth0.com', {
      reqheaders: {
        'content-type': 'application/json'
      },    
    })
      .get('/geoip/188.6.125.49?token=YOUR_AUTH0SIGNALS_API_KEY')
      .reply(429);
    rule(user, context, (err, u, c) => {
      expect(err).toBeFalsy();
      expect(c).toEqual(context);
      expect(c.idToken['https://example.com/country_code']).toEqual(undefined);
      expect(c.idToken['https://example.com/continent_code']).toEqual(undefined);
      expect(c.idToken['https://example.com/asn']).toEqual(undefined);
      expect(c.idToken['https://example.com/asn_name']).toEqual(undefined);
      done();
    });
  });
  
});

