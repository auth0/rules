'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'saml-attribute-mapping';

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

  it('should add samlConfiguration mappings', (done) => {
    const expectedMappings = {
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': 'user_id',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress':   'email',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name':           'name',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/food':           'user_metadata.favorite_food',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/address':        'app_metadata.shipping_address'
    };
    
    rule({}, context, (err, u, c) => {
      expect(err).toBeFalsy();
      expect(c.samlConfiguration.mappings).toEqual(expectedMappings);

      done();
    });
  });
});
