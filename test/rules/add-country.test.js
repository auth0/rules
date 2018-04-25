'use strict';

const loadRule = require('../utils/load-rule');

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
      context = {
        idToken: {},
        request: {
          geoip: {
            country_name: 'narnia',
            time_zone: 'UTC-5'
          }
        }
      };
    })
    it('should set the idToken dictionaries with correct values', (done) => {
      const outerContext = context;
      rule(user, context, (err, user, context) => {
        expect(context.idToken['https://example.com/country']).toBe(outerContext.request.geoip.country_name);
        expect(context.idToken['https://example.com/timezone']).toBe(outerContext.request.geoip.time_zone);

        done();
      });
    });
  })
});
