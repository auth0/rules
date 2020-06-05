'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'add-country';

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