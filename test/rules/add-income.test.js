'use strict';
const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');
const UserBuilder = require('../utils/userBuilder');

const ruleName = 'add-income';
describe(ruleName, () => {
  let rule;
  let context;
  let user;
  let globals;

  beforeEach(() => {
    globals = {
      global: {},
      request: {
        get: jest.fn()
      },
      auth0: {
        users: {
          updateUserMetadata: jest.fn()
        }
      }
    };

    user = new UserBuilder()
      .build();


    const request = new RequestBuilder()
      .withGeoIp({
        country_code: 'US',
        postal_code: 10001
      })
      .build();
    context = new ContextBuilder()
      .withRequest(request)
      .build();
  });

  describe('when incomeData exists', () => {
    beforeEach(() => {
      globals.global = {
        incomeData: incomeDataSample
      }
  
      rule = loadRule(ruleName, globals);
    });
    it('should set the income data on user metadata', (done) => {
      const updateUserMetadataMock = globals.auth0.users.updateUserMetadata;
      updateUserMetadataMock.mockReturnValue(Promise.resolve());
      
      rule(user, context, (e, u, c) => {
        const call = updateUserMetadataMock.mock.calls[0];
        expect(call[0]).toBe(user.user_id);
        expect(call[1].zipcode_income).toBe(incomeDataSample[context.request.geoip.postal_code]);

        done();
      });
    });
  });

  describe('when incomeData does not exist', () => {
    beforeEach(() => {
      globals.global = {
        incomeData: undefined
      };
  
      rule = loadRule(ruleName, globals);
    });

    it('should retreive and set the income data', (done) => {
      const updateUserMetadataMock = globals.auth0.users.updateUserMetadata;
      updateUserMetadataMock.mockReturnValue(Promise.resolve());
      
      rule(user, context, (e, u, c) => {
        const call = updateUserMetadataMock.mock.calls[0];
        expect(call[0]).toBe(user.user_id);
        expect(call[1].zipcode_income).toBe(incomeDataSample[context.request.geoip.postal_code]);

        done();
      });

      globals.request.get.mock.calls[0][2](null, { statusCode: 200 }, incomeDataSample);
    });

  });
});

const incomeDataSample = {
  [10001]: 81671,
  [10002]: 33218
}