/**
 * @title Fraud Prevention
 * @overview Send the user's IP address, user agent, email address and username in MD5 to MaxMind's MinFraud API.
 *
 * This rule will send the user's IP address, user agent, email address (in MD5) and username (in MD5) to MaxMind's MinFraud API. This API will return information about this current transaction like the location, a risk score, ...
 *
 * > Note: You will need to sign up here to get a license key https://www.maxmind.com/
 *
 */

'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'Alternate Identity Risk Score';

describe(ruleName, () => {
  let user;
  let context;
  let rule;

  beforeEach(() => {
    rule = loadRule(ruleName);
  });

  describe('when request has geoip', () => {
    beforeEach(() => {
      const request = new RequestBuilder().build();
      context = new ContextBuilder()
        .withRequest(request)
        .build();
    })
    it('should set the idToken dictionaries with correct values', (done) => {
      rule(user, context, (err, u, c) => {
        expect(c.idToken['https://example.com/country']).toBe(context.request.geoip.country_name);
        expect(c.idToken['https://example.com/timezone']).toBe(context.request.geoip.time_zone);

        done();
      });
    });
  })
});
